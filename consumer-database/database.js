const { Kafka } = require("kafkajs");
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

// Configuración de la base de datos
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: "mysql",
    }
);

// Modelo de Usuario
const User = require("./models/User")(sequelize, DataTypes);

// Conexión a Kafka
const kafka = new Kafka({
    clientId: "database-consumer",
    brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "database-group" });

const run = async () => {
    // Conectar a la base de datos y sincronizar modelos
    await sequelize.authenticate();
    console.log("Conectado a la base de datos.");
    await sequelize.sync({ alter: true });

    // Conectar a Kafka
    await consumer.connect();
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: true });

    console.log("Conectado a Kafka, esperando eventos...");

    await consumer.run({
        eachMessage: async ({ message }) => {
            const event = JSON.parse(message.value.toString());
            const { user, movie, timestamp } = event;

            // Registrar película vista en la base de datos
            const [dbUser, created] = await User.findOrCreate({
                where: { name: user.name },
                defaults: { age: user.age },
            });

            await dbUser.createMovie({
                title: movie.title,
                watchedAt: timestamp,
            });

            console.log(`Registrada película '${movie.title}' para el usuario ${user.name}.`);
        },
    });
};

run().catch(console.error);