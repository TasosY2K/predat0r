const dbConfig = require("../../db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Bots = require("./bots.js")(sequelize, Sequelize);
db.Boot = require("./boot.js")(sequelize, Sequelize);
db.Screenshots = require("./screenshots.js")(sequelize, Sequelize);
db.Chrome = require("./chrome.js")(sequelize, Sequelize);
db.Cookies = require("./cookies.js")(sequelize, Sequelize);
db.Discord = require("./discord.js")(sequelize, Sequelize);
db.Filezilla = require("./filezilla.js")(sequelize, Sequelize);
db.Address = require("./addresses.js")(sequelize, Sequelize);

module.exports = db;
