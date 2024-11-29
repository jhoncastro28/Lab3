const { Kafka } = require("kafkajs");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

// Configuración de Kafka
const kafka = new Kafka({
    clientId: "analytics-consumer",
    brokers: [process.env.KAFKA_BROKER]
});

const consumer = kafka.consumer({ groupId: "analytics-group" });

// Configuración de Express y Socket.IO
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Contador de vistas
const movieViews = {};

io.on("connection", (socket) => {
    console.log("Cliente conectado al dashboard");

    // Enviar estadísticas actuales al cliente al conectarse
    socket.emit("update_top_movies", getTopMovies());
});

// Función para obtener el top 10
function getTopMovies() {
    return Object.entries(movieViews)
        .sort(([, a], [, b]) => b - a) // Ordenar por vistas (descendente)
        .slice(0, 10) // Tomar los primeros 10
        .map(([title, views]) => ({ title, views }));
}

// Consumir eventos de Kafka
const run = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: true });

    console.log("Conectado a Kafka, esperando eventos...");
    await consumer.run({
        eachMessage: async ({ message }) => {
            const event = JSON.parse(message.value.toString());
            const movieTitle = event.movie.title;

            // Incrementar contador de vistas
            movieViews[movieTitle] = (movieViews[movieTitle] || 0) + 1;

            console.log(`Actualizado: ${movieTitle} -> ${movieViews[movieTitle]} vistas`);

            // Enviar estadísticas actualizadas al cliente
            io.emit("update_top_movies", getTopMovies());
        }
    });
};

run().catch(console.error);

// Servir los archivos estáticos del dashboard
app.use(express.static("public"));

// Iniciar el servidor
const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
    console.log(`Servidor de Analytics corriendo en http://localhost:${PORT}`);
});