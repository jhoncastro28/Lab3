const socket = io();

socket.on("update_top_movies", (movies) => {
    const movieList = document.getElementById("movie-list");
    movieList.innerHTML = ""; // Limpiar la lista

    movies.forEach(({ title, views }) => {
        const li = document.createElement("li");
        li.textContent = `${title} - ${views} vistas`;
        movieList.appendChild(li);
    });
});
