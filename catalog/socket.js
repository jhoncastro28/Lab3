const io = require("socket.io")(3001, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", socket => {
    console.log("Cliente conectado:", socket.id);

    // Manejar evento de película seleccionada
    socket.on("movie_selected", eventData => {
        console.log("Evento recibido:", eventData);
        // Emitir evento a todos los consumidores
        io.emit("new_event", eventData);
    });

    socket.on("disconnect", () => {
        console.log("Cliente desconectado:", socket.id);
    });
});