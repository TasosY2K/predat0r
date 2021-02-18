const { nanoid} = require("nanoid");
const db = require("../../models");

module.exports = (application) => {
    application.post("/bots/register", (req, res) => {
        const identifier = nanoid();
        const token = nanoid();
        db.Bots.create({
            identifier: identifier,
            token: token,
            ipAddress: req.connection.remoteAddress
        }).then(() => {
            res.status(200).json({
                message: "Bot registered OK",
                identifier: identifier,
                token: token
            });
        });
    });

    application.get("/bots/check/:identifier", (req, res) => {
        const identifier = req.params.identifier;
        if (identifier) {
            db.Bots.findAll({
                where: {
                    identifier: identifier
                }
            }).then((results) => {
                if (results.length > 0) {
                    res.status(200).json({
                        message: "Bot found"
                    })
                } else {
                    res.status(404).json({
                        message: "Bot not found",
                    });
                }
            });
        } else {
            res.status(403).json({
                message: "Missing POST field",
            });
        }
    });
};
