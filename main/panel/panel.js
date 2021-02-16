const express = require('express');
const path = require('path');
const filesystem = require('fs');
const cookeParser = require('cookie-parser');
const authcord = require('../library/authcord');
const filewalker = require('../library/walk.js');

const application = express();

application.set('views', path.join(__dirname, 'views'));
application.set('view engine', 'pug');

application.use(cookeParser());
application.use(express.static(path.join(__dirname, 'public')));

async function init(client, secret) {
  const routes = await filewalker.walk(`${__dirname}/routes/`);

  routes.forEach((route) => {
    const time = new Date().getMilliseconds();
    require(route.path)(application, client, secret);
    console.log(`[ROUTE] loaded route ${route.name} in ${new Date().getMilliseconds() - time}ms`);
  });

  const listener = application.listen(process.env.PANEL_PORT, function() {
    console.log('[PANEL] listening on port ' + listener.address().port);
  });
}

module.exports = {init};
