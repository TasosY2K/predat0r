module.exports = (sequelize, Sequelize) => {
    const Chrome = sequelize.define("chrome", {
        identifier: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        host: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        user: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    });
    return Chrome;
};
