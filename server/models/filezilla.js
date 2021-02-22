module.exports = (sequelize, Sequelize) => {
    const Filezilla = sequelize.define("filezilla", {
        identifier: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        host: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        port: {
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
    return Filezilla;
};
