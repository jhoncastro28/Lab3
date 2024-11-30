const { Kafka } = require("kafkajs");
const socketIo = require("socket.io");
require("dotenv").config();

// Configuración de Kafka
const kafka = new Kafka({
    clientId: "movie-producer",
    brokers: process.env.KAFKA_BROKERS.split(",")
});
const producer = kafka.producer();
const topic = process.env.KAFKA_TOPIC;

// Configuración del servidor Socket.IO
const PORT = process.env.PRODUCER_PORT || 3002;
const io = socketIo(PORT, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    host: '0.0.0.0' // Escuchar en todas las interfaces
});

const run = async () => {
    await producer.connect();
    console.log("Producer conectado a Kafka");

    io.on("connection", (socket) => {
        console.log("Cliente conectado:", socket.id);

        socket.on("movie_selected", async (data) => {
            console.log("Evento recibido:", data);

            try {
                // Enviar el evento al tema de Kafka
                await producer.send({
                    topic: topic,
                    messages: [{ value: JSON.stringify(data) }]
                });
                console.log("Evento publicado en Kafka");
            } catch (err) {
                console.error("Error al publicar evento:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log("Cliente desconectado:", socket.id);
        });
    });
};

run().catch(console.error);