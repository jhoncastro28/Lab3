const express = require('express');
const axios = require('axios');
const { io: io_client } = require("socket.io-client");
const { Client: SSHClient } = require('ssh2');
const http = require('http');
require('dotenv').config();

// Configuración de TMDb API
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3/movie/popular';
const IPLOCAL = process.env.IPLOCAL;

const PRODUCER_URL = process.env.PRODUCER_URL || "http://192.168.0.36:3002";
const SSH_HOST = process.env.SSH_HOST || "192.168.0.36";
const SSH_USER = process.env.SSH_USER || "your-ssh-user";
const SSH_PASSWORD = process.env.SSH_PASSWORD || "your-ssh-password";

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server); // Socket.IO para clientes frontend

const PORT = process.env.PORT || 3000;

// ** Nueva configuración SSH y Socket.IO para el producer ** //
const conn = new SSHClient();
const producerSocket = io_client(PRODUCER_URL);

conn.on("ready", () => {
    console.log("Conexión SSH lista.");

    // Leer logs en tiempo real y emitir eventos al producer
    conn.exec("tail -f /path/to/log/file", (err, stream) => {
        if (err) throw err;

        stream.on("data", (data) => {
            const movieData = parseMovieData(data.toString());
            console.log("Datos recibidos:", movieData);

            // Emitir evento al producer
            producerSocket.emit("movie_selected", movieData, (ack) => {
                console.log("ACK del producer:", ack);
            });
        });

        stream.stderr.on("data", (data) => {
            console.error("Error en el stream SSH:", data.toString());
        });
    });
}).connect({
    host: SSH_HOST,
    port: 22, // Puerto SSH predeterminado
    username: SSH_USER,
    password: SSH_PASSWORD, // Autenticación con contraseña
});

// Manejo de errores en conexiones
producerSocket.on("connect", () => console.log("Conectado al producer."));
producerSocket.on("connect_error", (err) => console.error("Error al conectar al producer:", err.message));
producerSocket.on("disconnect", () => console.log("Desconectado del producer."));

// Función para parsear datos de logs
function parseMovieData(logLine) {
    const parts = logLine.trim().split(" ");
    return {
        movie: {
            id: parts[0],
            title: parts.slice(1).join(" "),
        },
        user: {
            name: "User Example",
            age: 25,
            parentEmail: "parent@example.com",
        },
        timestamp: new Date().toISOString(),
    };
}

// ** Fin de nueva funcionalidad ** //

// Conexión de Socket.IO
io.on('connection', (socket) => {
    console.log('Usuario conectado');

    socket.on('movie_selected', async (data) => {
        console.log('Película seleccionada:', data);

        // Emitir evento al producer
        producerSocket.emit('movie_selected', data, (ack) => {
            console.log('ACK del producer:', ack);
        });
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
    console.log(`Servidor corriendo en http://${IPLOCAL}:${PORT}`);
});