const { nanoid} = require("nanoid");
const bcrypt = require("bcryptjs");
const db = require("../../models");
const ip = require("../../scripts/ip.js");
const v = require("../../scripts/verifier.js");

module.exports = (application) => {
    application.post("/bots/register", async (req, res) => {
        const identifier = nanoid();
        const token = nanoid();
        const ipAddress = "78.87.194.58";
        let ipInfo = await ip.info(ipAddress);
        ipInfo = ipInfo.data;

        let options = {};

        options.identifier = identifier;
        options.token = bcrypt.hashSync(token);

        options.ipAddress = ipAddress;
        options.country = ipInfo.country;
        options.countryCode = ipInfo.countryCode;
        options.region = ipInfo.regionName;
        options.regionCode = ipInfo.region;
        options.city = ipInfo.city;
        options.lat = ipInfo.lat;
        options.lon = ipInfo.lon;
        options.isp = ipInfo.isp;

        db.Bots.create(options).then(() => {
            res.status(200).json({
                message: "Bot registered OK",
                identifier: identifier,
                token: token
            });
        });
    });

    application.get("/bots/check/:identifier/:token", async (req, res) => {
        const { identifier, token } = req.params;
        if (identifier && token) {
            const verify = await v.validate(identifier, token);
            if (verify) {
                res.status(200).json({
                    message: "Bot found and token matches"
                });
            } else {
                res.status(401).json({
                    message: "Bot ot found or token/id is invalid"
                });
            }
        } else {
            res.status(403).json({
                message: "Missing POST field",
            });
        }
    });
};