const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { Pool } = require("pg");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing in server/.env");
}

const pool = new Pool({
  connectionString: databaseUrl,
});

async function initializeDatabase() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  await pool.query(schemaSql);
}

module.exports = { databaseUrl, initializeDatabase, pool };
