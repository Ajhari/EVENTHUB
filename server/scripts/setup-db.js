const { databaseUrl, initializeDatabase, pool } = require("../db");

async function reportDatabase() {
  await initializeDatabase();
  const result = await pool.query("SELECT COUNT(*) AS count FROM vendors");
  console.log(`PostgreSQL database ready: ${databaseUrl}`);
  console.log(`Vendor profiles: ${result.rows[0].count}`);
  await pool.end();
}

reportDatabase().catch((error) => {
  console.error("PostgreSQL setup failed:", error.message);
  process.exitCode = 1;
});
