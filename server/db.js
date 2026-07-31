const fs = require("fs");
const path = require("path");
require("dotenv").config();
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const seedVendors = require("./data/seed-vendors");

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
  await seedDemoVendors();
}

async function seedDemoVendors() {
  const existing = await pool.query("SELECT COUNT(*) AS count FROM vendors");
  if (Number(existing.rows[0].count) > 0) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const [index, vendor] of seedVendors.entries()) {
      const [businessName, location, contact, description, price, foodType, eventType] = vendor;
      const hashedDemoPassword = await bcrypt.hash("demo123", 10);

      const user = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'vendor')
         RETURNING id`,
        [businessName, `demo.vendor${index + 1}@eventhub.local`, hashedDemoPassword]
      );

      await client.query(
        `INSERT INTO vendors
          (user_id, business_name, location, contact_number, description, price_range, food_type, event_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          user.rows[0].id,
          businessName.toUpperCase(),
          location.toUpperCase(),
          contact,
          description.toUpperCase(),
          price,
          foodType,
          eventType,
        ]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { databaseUrl, initializeDatabase, pool };
