const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

// Modelo para el usuario
const User = sequelize.define("User", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

// Modelo para las películas vistas por el usuario
const Movie = sequelize.define("Movie", {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

// Relación entre usuarios y películas
User.hasMany(Movie, { as: "movies" });
Movie.belongsTo(User);

module.exports = { User, Movie };