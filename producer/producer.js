const { Kafka } = require("kafkajs");

// Configurar Kafka
const kafka = new Kafka({
    clientId: "movie-producer",
    brokers: ["localhost:9092"] // Dirección del broker Kafka
});

// Crear un producer
const producer = kafka.producer();

const run = async () => {
    await producer.connect();
    console.log("Producer conectado a Kafka");

    // Simular el envío de eventos desde el frontend (socket.io)
    const io = require("socket.io")(3002, {
        cors: { origin: "*" }
    });

    io.on("connection", (socket) => {
        console.log("Cliente conectado:", socket.id);

        // Escuchar eventos de selección de películas
        socket.on("movie_selected", async (data) => {
            console.log("Evento recibido:", data);

            try {
                // Enviar el evento al tema "movie-events"
                await producer.send({
                    topic: "movie-events",
                    messages: [
                        { value: JSON.stringify(data) }
                    ]
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