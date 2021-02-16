const express = require("express");
const path = require("path");
const filewalker = require("../library/walk.js");

const application = express();

async function init() {
    const routes = await filewalker.walk(path.join(__dirname, "routes"));

    routes.forEach((route) => {
        const time = new Date().getMilliseconds();
        require(route.path)(application);
        console.log(
            `[ROUTE] loaded route ${route.name} in ${
                new Date().getMilliseconds() - time
            }ms`
        );
    });

    const listener = application.listen(process.env.PANEL_PORT, function () {
        console.log("[PANEL] listening on http://127.0.0.1:" + listener.address().port);
    });
}

module.exports = { init };
