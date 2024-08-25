const { env } = require("../config/config.js");
const { Pool } = require("pg");

module.exports = new Pool({ connectionString: env.database.url });
