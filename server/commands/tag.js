const db = require("../models");

exports.run = (client, message, args) => {
    if (args.length == 2) {
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
            message.channel.send("Tag updated OK");
        });
    } else {
        message.channel.send("Invalid");
    }
};
