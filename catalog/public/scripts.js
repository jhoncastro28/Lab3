// Conexión con Socket.IO
const socket = io();

// Función para obtener las películas del backend
async function fetchMovies() {
    try {
        const response = await fetch('/movies');
        const movies = await response.json();

        const movieList = document.getElementById('movie-list');
        movies.forEach(movie => {
            const movieItem = document.createElement('div');
            movieItem.className = 'movie-item';
            movieItem.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                <h3>${movie.title}</h3>
            `;
            movieItem.addEventListener('click', () => selectMovie(movie));
            movieList.appendChild(movieItem);
        });
    } catch (error) {
        console.error("Error al cargar las películas:", error);
    }
}

// Función para manejar la selección de una película
function selectMovie(movie) {
    const modal = document.getElementById('movie-modal');
    const movieTitle = document.getElementById('movie-title');
    const form = document.getElementById('user-form');
    const parentEmailSection = document.getElementById('parent-email-section');

    movieTitle.textContent = movie.title;
    modal.style.display = 'flex';

    form.onsubmit = (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const age = parseInt(document.getElementById('age').value);
        const parentEmail = document.getElementById('parent-email').value.trim();

        if (!name || !age || (age < 18 && !parentEmail)) {
            alert("Por favor, complete todos los campos requeridos.");
            return;
        }

        socket.emit("movie_selected", {
            movie,
            user: { name, age, parentEmail: age < 18 ? parentEmail : null },
            timestamp: new Date().toISOString()
        });

        alert(`Has seleccionado: ${movie.title}`);
        modal.style.display = 'none';
    };

    document.getElementById('age').oninput = (e) => {
        if (parseInt(e.target.value) < 18) {
            parentEmailSection.style.display = 'block';
        } else {
            parentEmailSection.style.display = 'none';
        }
    };
}

// Cerrar el modal
document.querySelector('.close').onclick = () => {
    document.getElementById('movie-modal').style.display = 'none';
};

// Llamar a la función para obtener las películas al cargar la página
document.addEventListener('DOMContentLoaded', fetchMovies);
