module.exports = (sequelize, Sequelize) => {
    const Sceenshot = sequelize.define("screenshots", {
        identifier: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        link: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    });
    return Sceenshot;
};
