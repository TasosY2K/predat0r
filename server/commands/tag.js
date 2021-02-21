const db = require("../models");

exports.run = (client, message, args) => {
    if (args.length == 2) {
        db.Bots.findAll({
            where: {
                id: args[0],
            },
        }).then((results) => {
            if (results.length > 0) {
                db.Bots.update(
                    {
                        tag: args[1],
                    },
                    {
                        where: {
                            id: args[0],
                        },
                    }
                ).then(() => {
                    message.channel.send("Tag updated");
                });
            } else {
                message.channel.send("Invalid ID");
            }
        });
    } else {
        message.channel.send("Invalid arguments");
    }
};
