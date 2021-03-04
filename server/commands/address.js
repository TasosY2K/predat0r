const WAValidator = require("wallet-address-validator");
const db = require("../models");

exports.run = (client, message, args) => {
    if (
        args.length == 2 &&
        args[0].toLowerCase() == "btc" &&
        WAValidator.validate(args[1], args[0])
    ) {
        db.Address.findAll().then((results) => {
            if (results.length > 0) {
                db.Address.update(
                    {
                        crypto: args[0].toLowerCase(),
                        address: args[1],
                    },
                    {
                        where: {
                            crypto: "btc",
                        },
                    }
                ).then(() => {
                    message.channel.send(args[0] + " address updated");
                });
            } else {
                db.Address.create({
                    crypto: args[0].toLowerCase(),
                    address: args[1],
                }).then(() => {
                    message.channel.send(args[0] + " address updated");
                });
            }
        });
    } else if (args.length == 1) {
        if (args[0] == "remove") {
            db.Address.destroy({
                where: {
                    crypto: "btc",
                },
            }).then((results) => {
                message.channel.send("Address removed");
            });
        } else {
            message.channel.send("Invalid argument");
        }
    } else if (args.length == 0) {
        db.Address.findAll({
            where: {
                crypto: "btc",
            },
        }).then((results) => {
            if (results.length > 0) {
                message.channel.send(
                    `\`\`\`TYPE: ${results[0].crypto}\nADDRESS: ${results[0].address}\`\`\``
                );
            } else {
                message.channel.send("No address set");
            }
        });
    } else {
        message.channel.send("Invalid type or address");
    }
};
