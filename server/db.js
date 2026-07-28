const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const demoVendors = require("./data/demo-vendors");

const databasePath = process.env.SQLITE_DB_PATH
  ? path.resolve(process.env.SQLITE_DB_PATH)
  : path.join(__dirname, "data", "eventhub.db");

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const database = new DatabaseSync(databasePath);
database.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'vendor')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE REFERENCES users(id),
    business_name TEXT NOT NULL,
    location TEXT NOT NULL,
    contact_number TEXT,
    description TEXT,
    price_range TEXT,
    food_type TEXT,
    event_type TEXT,
    available_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS vendor_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER REFERENCES vendors(id),
    event_type TEXT NOT NULL,
    food_type TEXT NOT NULL,
    available_date TEXT NOT NULL,
    UNIQUE (vendor_id, event_type, food_type, available_date)
  );
  CREATE TABLE IF NOT EXISTS vendor_booked_dates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER REFERENCES vendors(id),
    booked_date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (vendor_id, booked_date)
  );
  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER REFERENCES users(id),
    vendor_id INTEGER REFERENCES vendors(id),
    event_date TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

function convertQuery(sql, values) {
  const parameters = [];
  const convertedSql = sql.replace(/\$(\d+)/g, (_match, number) => {
    parameters.push(values[Number(number) - 1]);
    return "?";
  });
  return { sql: convertedSql, parameters };
}

function normalizeError(error) {
  if (String(error.code).startsWith("SQLITE_CONSTRAINT_UNIQUE")) {
    error.code = "23505";
  }
  return error;
}

function query(sql, values = []) {
  try {
    const trimmed = sql.trim();
    if (!values.length && /^(BEGIN|COMMIT|ROLLBACK)$/i.test(trimmed)) {
      database.exec(trimmed);
      return { rows: [] };
    }

    const converted = convertQuery(sql, values);
    const statement = database.prepare(converted.sql);
    const returnsRows = /^(SELECT|WITH|PRAGMA)/i.test(trimmed) || /\bRETURNING\b/i.test(trimmed);

    if (returnsRows) {
      return { rows: statement.all(...converted.parameters) };
    }

    const result = statement.run(...converted.parameters);
    return { rows: [], rowCount: Number(result.changes) };
  } catch (error) {
    throw normalizeError(error);
  }
}

function seedDemoVendors() {
  const existing = query("SELECT COUNT(*) AS count FROM vendors").rows[0].count;
  if (existing > 0) return;

  database.exec("BEGIN");
  try {
    demoVendors.forEach((vendor, index) => {
      const [businessName, location, contact, description, price, foodType, eventType] = vendor;
      const user = query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'vendor') RETURNING id`,
        [businessName, `demo.vendor${index + 1}@eventhub.local`, "demo123"]
      ).rows[0];
      query(
        `INSERT INTO vendors
          (user_id, business_name, location, contact_number, description, price_range, food_type, event_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.id, businessName.toUpperCase(), location.toUpperCase(), contact, description.toUpperCase(), price, foodType, eventType]
      );
    });
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

seedDemoVendors();

const pool = {
  query: async (sql, values) => query(sql, values),
  connect: async () => ({ query: async (sql, values) => query(sql, values), release() {} }),
  end: async () => database.close(),
};

module.exports = { databasePath, pool };
