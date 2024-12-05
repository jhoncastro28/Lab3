const io = require("socket.io")(3001, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    // Manejar evento de película seleccionada
    socket.on("movie_selected", (eventData) => {
        console.log("Evento recibido en catalog:", eventData);

        // Redirigir el evento al producer (puerto 3002)
        const producerSocket = require("socket.io-client")("http://192.168.0.34:3002");
        producerSocket.emit("movie_selected", eventData);
    });

    socket.on("disconnect", () => {
        console.log("Cliente desconectado:", socket.id);
    });
});