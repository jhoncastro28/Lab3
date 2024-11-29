const socket = io();

// Al cargar la página, cargamos el catálogo
document.addEventListener("DOMContentLoaded", () => {
    fetch("/catalog")
        .then(response => response.json())
        .then(data => renderCatalog(data))
        .catch(err => console.error("Error al cargar el catálogo:", err));
});

// Renderiza el catálogo de películas
function renderCatalog(movies) {
    const container = document.getElementById("catalog-container");
    container.innerHTML = ""; // Limpiar contenido previo
    movies.forEach(movie => {
        const movieDiv = document.createElement("div");
        movieDiv.className = "movie";
        movieDiv.innerHTML = `
            <img src="${movie.image}" alt="${movie.title}" />
            <p>${movie.title}</p>
        `;
        movieDiv.addEventListener("click", () => selectMovie(movie));
        container.appendChild(movieDiv);
    });
}

// Evento al seleccionar una película
function selectMovie(movie) {
    const userName = prompt("Ingrese su nombre:");
    const userAge = prompt("Ingrese su edad:");
    let parentEmail = null;

    if (parseInt(userAge) < 18) {
        parentEmail = prompt("Ingrese el correo electrónico de sus padres:");
    }

    // Emitir evento con los datos del usuario
    socket.emit("movie_selected", {
        movie,
        user: { name: userName, age: userAge, parentEmail },
        timestamp: new Date().toISOString()
    });

    alert(`Has seleccionado: ${movie.title}`);
}