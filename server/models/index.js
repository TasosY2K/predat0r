const dbConfig = require("../../db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Bots = require("./bots.js")(sequelize, Sequelize);
db.Chrome = require("./chrome.js")(sequelize, Sequelize);
db.Screenshots = require("./screenshots.js")(sequelize, Sequelize);

module.exports = db;
