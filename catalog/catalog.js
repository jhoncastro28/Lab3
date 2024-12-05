const express = require('express');
const axios = require('axios');
const socketIo = require('socket.io');
const http = require('http');
const io_client = require('socket.io-client');
require('dotenv').config();

// Configuración de TMDb API
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3/movie/popular';
const PRODUCER_URL = `http://${process.env.IPLOCAL}:${process.env.PRODUCER_PORT}`;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Configuración del socket cliente para el producer
const producerSocket = io_client(PRODUCER_URL, {
    transports: ['websocket']
});

// Conexión de Socket.IO
io.on('connection', (socket) => {
    console.log('Usuario conectado');
    
    // Emitir evento cuando se selecciona una película
    socket.on('movie_selected', (data) => {
        console.log('Película seleccionada:', data);

        // Enviar evento directamente al producer
        producerSocket.emit('movie_selected', data);
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
    console.log(`Servidor corriendo en http://${process.env.IPLOCAL}:${PORT}`);
});
