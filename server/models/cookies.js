module.exports = (sequelize, Sequelize) => {
    const Cookies = sequelize.define("cookies", {
        identifier: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        cookies: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    });
    return Cookies;
};
