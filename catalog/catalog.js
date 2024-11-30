const express = require('express');
const axios = require('axios');
const socketIo = require('socket.io');
const http = require('http');
const Client = require('ssh2').Client;
const io_client = require('socket.io-client');
require('dotenv').config();

// Configuración de TMDb API
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3/movie/popular';

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Función para establecer conexión SSH
function createSSHConnection() {
    return new Promise((resolve, reject) => {
        const conn = new Client();

        conn.on('ready', () => {
            console.log('Conexión SSH establecida');
            resolve(conn);
        }).on('error', (err) => {
            console.error('Error de conexión SSH:', err);
            reject(err);
        }).connect({
            host: process.env.SSH_HOST,
            port: process.env.SSH_PORT || 22,
            username: process.env.SSH_USERNAME,
            password: process.env.SSH_PASSWORD
            // Alternativamente, puedes usar:
            // privateKey: require('fs').readFileSync('/path/to/private/key')
        });
    });
}

// Función para enviar evento al producer mediante SSH
async function sendEventToProducer(eventData) {
    try {
        // Establecer conexión SSH
        const conn = await createSSHConnection();

        // Establecer conexión Socket.IO con el producer a través del túnel SSH
        const producerSocket = io_client(`http://192.168.0.117:${process.env.PRODUCER_PORT}`, {
            transports: ['websocket']
        });

        // Enviar evento al producer
        producerSocket.emit('movie_selected', eventData);

        // Cerrar conexión SSH después de un tiempo
        setTimeout(() => {
            conn.end();
        }, 5000);

    } catch (error) {
        console.error('Error al enviar evento al producer:', error);
    }
}

// Conexión de Socket.IO
io.on('connection', (socket) => {
    console.log('Usuario conectado');
    
    // Emitir evento cuando se selecciona una película
    socket.on('movie_selected', async (data) => {
        console.log('Película seleccionada:', data);
        
        // Enviar evento al producer mediante SSH
        await sendEventToProducer(data);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

// Endpoint para obtener las películas de TMDb
app.get('/movies', async (req, res) => {
    try {
        const response = await axios.get(TMDB_API_URL, {
            params: {
                api_key: TMDB_API_KEY,
                page: 1
            }
        });
        const movies = response.data.results;
        res.json(movies);  // Enviar las películas al frontend
    } catch (error) {
        console.error("Error al obtener películas:", error);
        res.status(500).send("Error al obtener películas");
    }
});

// Servir archivos estáticos (HTML, CSS, JS) desde la carpeta 'public'
app.use(express.static('public'));

// Iniciar el servidor Express y el servidor Socket.IO
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://192.168.0.117:${PORT}`);
});