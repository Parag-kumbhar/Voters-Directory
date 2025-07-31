const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "188227",
  host: "localhost",
  port: 4000,
  database: "voterdb",
});

module.exports = pool;
