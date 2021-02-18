module.exports = (sequelize, Sequelize) => {
    const Bot = sequelize.define("bot", {
        identifier: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        token: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        ipAddress: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    });
    return Bot;
};
