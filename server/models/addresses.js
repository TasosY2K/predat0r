module.exports = (sequelize, Sequelize) => {
    const Address = sequelize.define("addresses", {
        crypto: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        address: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    });
    return Address;
};
