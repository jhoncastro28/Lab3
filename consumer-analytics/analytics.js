const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { Kafka } = require("kafkajs");
require("dotenv").config();

// Configuración de Kafka
const kafka = new Kafka({
    clientId: "consumer-analytics",
    brokers: process.env.KAFKA_BROKERS.split(","),
});
const consumer = kafka.consumer({ groupId: "analytics-group" });

// Gestión de películas (en memoria)
const movies = {};

// Configuración del servidor Express y Socket.IO
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Servir archivos estáticos
app.use(express.static("public"));

// Actualizar y emitir el top 10
const emitTop10 = () => {
    const topMovies = Object.values(movies)
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
    io.emit("update_top_10", topMovies);
};

// Conexión con Socket.IO
io.on("connection", (socket) => {
    console.log("Cliente conectado");
    emitTop10(); // Enviar el top 10 al cliente recién conectado
});

// Conectar al topic de Kafka
const run = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: true });

    console.log("Consumidor conectado a Kafka");

    await consumer.run({
        eachMessage: async ({ message }) => {
            const eventData = JSON.parse(message.value.toString());
            const { movie } = eventData;

            if (!movies[movie.id]) {
                movies[movie.id] = { title: movie.title, views: 0 };
            }
            movies[movie.id].views += 1;

            console.log(`Película actualizada: ${movie.title} (${movies[movie.id].views} visitas)`);

            emitTop10(); // Actualizar top 10
        },
    });
};

run().catch(console.error);

// Iniciar servidor
const PORT = process.env.ANALYTICS_PORT || 3003;
server.listen(PORT, () => {
    console.log(`Consumer Analytics corriendo en http://localhost:${PORT}`);
});