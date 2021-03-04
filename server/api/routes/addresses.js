const db = require("../../models");
const v = require("../../library/verifier.js");

module.exports = (application) => {
    application.get("/addresses/:identifier/:token", async (req, res) => {
        const { identifier, token } = req.params;
        if (identifier && token) {
            const verify = await v.validate(identifier, token);
            if (verify) {
                db.Address.findAll({
                    where: {
                        crypto: "btc",
                    },
                }).then((results) => {
                    if (results.length > 0) {
                        res.status(200).json({
                            type: results[0].crypto,
                            value: results[0].address,
                        });
                    } else {
                        res.status(403).json({
                            message: "No address found",
                        });
                    }
                });
            } else {
                res.status(401).json({
                    message: "Bot not found or token/id is invalid",
                });
            }
        } else {
            res.status(403).json({
                message: "Missing POST field",
            });
        }
    });
};
