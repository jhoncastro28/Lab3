// Función para cargar el recap del usuario
async function fetchRecap() {
    const userName = prompt("Ingrese su nombre para ver el recap:");
    if (!userName) return;

    try {
        const response = await fetch(`/recap?name=${encodeURIComponent(userName)}`);
        if (!response.ok) throw new Error("Error al obtener los datos del servidor");

        const data = await response.json();

        const container = document.getElementById("recap-container");
        container.innerHTML = ""; // Limpia el contenedor antes de agregar contenido

        if (data.movies.length === 0) {
            container.innerHTML = `<p>No se encontraron películas para el usuario ${userName}.</p>`;
            return;
        }

        // Crea una tarjeta para cada película
        data.movies.forEach(movie => {
            const movieCard = document.createElement("div");
            movieCard.className = "movie-card";
            movieCard.innerHTML = `
                <h3>${movie.title}</h3>
                <p>Visto el: ${new Date(movie.timestamp).toLocaleString()}</p>
            `;
            container.appendChild(movieCard);
        });
    } catch (error) {
        console.error("Error al cargar el recap:", error);
        alert("Ocurrió un error al cargar el recap. Intente nuevamente.");
    }
}

// Llama a la función de carga al cargar la página
document.addEventListener("DOMContentLoaded", fetchRecap);
