module.exports = (sequelize, Sequelize) => {
    const Discord = sequelize.define("tokens", {
        identifier: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        tokens: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    });
    return Discord;
};
