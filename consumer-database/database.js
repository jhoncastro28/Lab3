require("dotenv").config();
const { Kafka } = require("kafkajs");
const express = require("express");
const sequelize = require("./sequelize");
const { User, Movie } = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3004;

// Configuración de Kafka
const kafka = new Kafka({
    clientId: "movie-database",
    brokers: [process.env.KAFKA_BROKER],
});
const consumer = kafka.consumer({ groupId: "database-group" });

async function consumeEvents() {
    await consumer.connect();
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: true });

    console.log("Conectado al topic de Kafka. Esperando eventos...");

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const event = JSON.parse(message.value.toString());
            const { user, movie, timestamp } = event;

            try {
                // Buscar o crear el usuario
                const [userRecord] = await User.findOrCreate({
                    where: { name: user.name },
                    defaults: { age: user.age, email: user.parentEmail },
                });

                // Agregar la película al usuario
                await Movie.create({
                    title: movie.title,
                    timestamp: new Date(timestamp),
                    UserId: userRecord.id,
                });

                console.log(`Película '${movie.title}' añadida para el usuario '${user.name}'`);
            } catch (error) {
                console.error("Error al procesar evento:", error);
            }
        },
    });
}

// Endpoint para mostrar el recap
app.get("/recap", async (req, res) => {
    const { name } = req.query;
    if (!name) return res.status(400).send("Nombre del usuario requerido");

    try {
        const user = await User.findOne({
            where: { name },
            include: [{ model: Movie, as: "movies" }],
        });

        if (!user) return res.status(404).send("Usuario no encontrado");

        res.json({ movies: user.movies });
    } catch (error) {
        console.error("Error al obtener el recap:", error);
        res.status(500).send("Error interno del servidor");
    }
});

// Iniciar el servidor y el consumidor
app.listen(PORT, async () => {
    console.log(`Servidor corriendo en http://192.168.0.34:${PORT}`);
    await sequelize.sync();
    consumeEvents();
});