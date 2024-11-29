module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    const Movie = sequelize.define("Movie", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        watchedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });

    User.hasMany(Movie, { as: "movies" });
    Movie.belongsTo(User);

    return User;
};