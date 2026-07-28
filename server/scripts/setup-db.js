const { databasePath, pool } = require("../db");

async function reportDatabase() {
  const result = await pool.query("SELECT COUNT(*) AS count FROM vendors");
  console.log(`SQLite database ready at ${databasePath}`);
  console.log(`Vendor profiles: ${result.rows[0].count}`);
}

reportDatabase().catch((error) => {
  console.error("SQLite setup failed:", error.message);
  process.exitCode = 1;
});
