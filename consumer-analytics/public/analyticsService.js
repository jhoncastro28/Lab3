// Conexión con Socket.IO
const socket = io();

// Escuchar actualizaciones del top 10
socket.on("update_top_10", (topMovies) => {
    const topMoviesList = document.getElementById("top-movies");
    topMoviesList.innerHTML = "";

    // Renderizar las películas
    topMovies.forEach((movie, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${index + 1}. ${movie.title} - ${movie.views} visitas`;
        topMoviesList.appendChild(listItem);
    });
});