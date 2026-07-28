const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();

app.use(cors());
app.use(express.json());

function uppercaseText(value) {
  return typeof value === "string" ? value.toUpperCase() : value;
}

function formatVendor(row) {
  if (!row) {
    return row;
  }

  return {
    ...row,
    business_name: uppercaseText(row.business_name),
    location: uppercaseText(row.location),
    description: uppercaseText(row.description),
    price_range: uppercaseText(row.price_range),
    food_type: uppercaseText(row.food_type),
    event_type: uppercaseText(row.event_type),
  };
}

app.get("/", (req, res) => {
  res.send("EventHub API is running");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "EventHub backend is healthy" });
});


app.get("/api/vendors", async (req, res) => {
  try {
    const { location, sort, foodType, eventType, availableDate } = req.query;

    let query = "SELECT * FROM vendors";
    const values = [];
    const conditions = [];

    if (location) {
      values.push(`%${location}%`);
      conditions.push(`LOWER(location) LIKE LOWER($${values.length})`);
    }

    if (foodType) {
      values.push(foodType);
      conditions.push(`UPPER(food_type) = UPPER($${values.length})`);
    }

    if (eventType) {
      values.push(eventType);
      conditions.push(`UPPER(event_type) = UPPER($${values.length})`);
    }

    if (availableDate) {
      values.push(availableDate);
      conditions.push(
        `NOT EXISTS (
          SELECT 1
          FROM vendor_booked_dates
          WHERE vendor_booked_dates.vendor_id = vendors.id
          AND vendor_booked_dates.booked_date = $${values.length}
        )
        AND NOT EXISTS (
          SELECT 1
          FROM inquiries
          WHERE inquiries.vendor_id = vendors.id
          AND inquiries.event_date = $${values.length}
        )`
      );
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    if (sort === "oldest") {
      query += " ORDER BY id ASC";
    } else if (sort === "name") {
      query += " ORDER BY business_name ASC";
    } else {
      query += " ORDER BY id DESC";
    }

    const result = await pool.query(query, values);
    res.json(result.rows.map(formatVendor));
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/vendors/user/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const result = await pool.query(
      "SELECT * FROM vendors WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    res.json(formatVendor(result.rows[0]));
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/vendors/:id", async (req, res) => {
  try {
    const vendorId = Number(req.params.id);

    const result = await pool.query(
      "SELECT * FROM vendors WHERE id = $1",
      [vendorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json(formatVendor(result.rows[0]));
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/vendors", async (req, res) => {
  try {
    const {
      user_id,
      business_name,
      location,
      contact_number,
      description,
      price_range,
      food_type,
      event_type,
      available_date,
    } = req.body;

    if (!user_id || !business_name || !location) {
      return res.status(400).json({ message: "User, business name, and location are required" });
    }

    const digitsOnlyContact = contact_number ? contact_number.replace(/\D/g, "") : "";
    const profileAvailableDate = available_date || null;
    const normalizedBusinessName = uppercaseText(business_name);
    const normalizedLocation = uppercaseText(location);
    const normalizedDescription = uppercaseText(description);
    const normalizedPriceRange = uppercaseText(price_range);
    const normalizedFoodType = uppercaseText(food_type);
    const normalizedEventType = uppercaseText(event_type);

    if (contact_number && digitsOnlyContact.length < 10) {
      return res.status(400).json({ message: "Contact number should have at least 10 digits" });
    }

    const result = await pool.query(
      `INSERT INTO vendors (
        user_id,
        business_name,
        location,
        contact_number,
        description,
        price_range,
        food_type,
        event_type,
        available_date
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        user_id,
        normalizedBusinessName,
        normalizedLocation,
        contact_number,
        normalizedDescription,
        normalizedPriceRange,
        normalizedFoodType,
        normalizedEventType,
        profileAvailableDate,
      ]
    );

    res.status(201).json(formatVendor(result.rows[0]));
  } catch (error) {
    console.error("Error creating vendor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/vendors/:id", async (req, res) => {
  try {
    const vendorId = Number(req.params.id);
    const {
      business_name,
      location,
      contact_number,
      description,
      price_range,
      food_type,
      event_type,
      available_date,
    } = req.body;

    if (!business_name || !location) {
      return res.status(400).json({ message: "Business name and location are required" });
    }

    const digitsOnlyContact = contact_number ? contact_number.replace(/\D/g, "") : "";
    const profileAvailableDate = available_date || null;
    const normalizedBusinessName = uppercaseText(business_name);
    const normalizedLocation = uppercaseText(location);
    const normalizedDescription = uppercaseText(description);
    const normalizedPriceRange = uppercaseText(price_range);
    const normalizedFoodType = uppercaseText(food_type);
    const normalizedEventType = uppercaseText(event_type);

    if (contact_number && digitsOnlyContact.length < 10) {
      return res.status(400).json({ message: "Contact number should have at least 10 digits" });
    }

    const result = await pool.query(
      `UPDATE vendors
       SET business_name = $1,
           location = $2,
           contact_number = $3,
           description = $4,
           price_range = $5,
           food_type = $6,
           event_type = $7,
           available_date = $8
       WHERE id = $9
       RETURNING *`,
      [
        normalizedBusinessName,
        normalizedLocation,
        contact_number,
        normalizedDescription,
        normalizedPriceRange,
        normalizedFoodType,
        normalizedEventType,
        profileAvailableDate,
        vendorId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    res.json(formatVendor(result.rows[0]));
  } catch (error) {
    console.error("Error updating vendor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/vendors/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const vendorId = Number(req.params.id);

    await client.query("BEGIN");
    await client.query("DELETE FROM vendor_services WHERE vendor_id = $1", [vendorId]);
    await client.query("DELETE FROM vendor_booked_dates WHERE vendor_id = $1", [vendorId]);
    await client.query("DELETE FROM inquiries WHERE vendor_id = $1", [vendorId]);

    const result = await client.query(
      "DELETE FROM vendors WHERE id = $1 RETURNING *",
      [vendorId]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    await client.query("COMMIT");
    res.json({ message: "Vendor profile deleted successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting vendor profile:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

app.post("/api/vendor-services", async (req, res) => {
  try {
    const { vendor_id, event_type, food_type, available_date } = req.body;

    if (!vendor_id || !event_type || !food_type || !available_date) {
      return res.status(400).json({ message: "All service fields are required" });
    }

    const result = await pool.query(
      `INSERT INTO vendor_services (vendor_id, event_type, food_type, available_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [vendor_id, event_type, food_type, available_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding vendor service:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/vendor-services/range", async (req, res) => {
  try {
    const { vendor_id, event_type, food_type, start_date, end_date } = req.body;

    if (!vendor_id || !event_type || !food_type || !start_date || !end_date) {
      return res.status(400).json({ message: "All service range fields are required" });
    }

    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ message: "Start date cannot be after end date" });
    }

    const result = await pool.query(
      `WITH range_dates AS (
         SELECT generate_series($4::date, $5::date, interval '1 day')::date AS available_date
       ),
       inserted_services AS (
         INSERT INTO vendor_services (vendor_id, event_type, food_type, available_date)
         SELECT $1, $2, $3, range_dates.available_date
         FROM range_dates
         WHERE NOT EXISTS (
           SELECT 1
           FROM inquiries
           WHERE inquiries.vendor_id = $1
           AND inquiries.event_date = range_dates.available_date
         )
         AND NOT EXISTS (
           SELECT 1
           FROM vendor_services
           WHERE vendor_services.vendor_id = $1
           AND vendor_services.event_type = $2
           AND vendor_services.food_type = $3
           AND vendor_services.available_date = range_dates.available_date
         )
         RETURNING *
       )
       SELECT *
       FROM inserted_services
       ORDER BY available_date ASC`,
      [vendor_id, event_type, food_type, start_date, end_date]
    );

    res.status(201).json({
      message: `${result.rows.length} available dates saved`,
      services: result.rows,
    });
  } catch (error) {
    console.error("Error adding vendor service date range:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/vendor-services/:vendorId", async (req, res) => {
  try {
    const vendorId = Number(req.params.vendorId);

    const result = await pool.query(
      `SELECT *
       FROM vendor_services
       WHERE vendor_id = $1
       ORDER BY available_date ASC`,
      [vendorId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching vendor services:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/vendor-booked-dates/:vendorId", async (req, res) => {
  try {
    const vendorId = Number(req.params.vendorId);

    const manualBookedResult = await pool.query(
      `SELECT booked_date
       FROM vendor_booked_dates
       WHERE vendor_id = $1
       ORDER BY booked_date ASC`,
      [vendorId]
    );

    const inquiryBookedResult = await pool.query(
      `SELECT DISTINCT event_date
       FROM inquiries
       WHERE vendor_id = $1
       ORDER BY event_date ASC`,
      [vendorId]
    );

    res.json({
      manual_booked_dates: manualBookedResult.rows.map((row) => row.booked_date),
      inquiry_booked_dates: inquiryBookedResult.rows.map((row) => row.event_date),
    });
  } catch (error) {
    console.error("Error fetching vendor booked dates:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/vendor-booked-dates/:vendorId", async (req, res) => {
  const client = await pool.connect();

  try {
    const vendorId = Number(req.params.vendorId);
    const { booked_dates } = req.body;

    if (!Array.isArray(booked_dates)) {
      return res.status(400).json({ message: "Booked dates should be an array" });
    }

    await client.query("BEGIN");
    await client.query("DELETE FROM vendor_booked_dates WHERE vendor_id = $1", [vendorId]);

    for (const bookedDate of booked_dates) {
      await client.query(
        `INSERT INTO vendor_booked_dates (vendor_id, booked_date)
         VALUES ($1, $2)
         ON CONFLICT (vendor_id, booked_date) DO NOTHING`,
        [vendorId, bookedDate]
      );
    }

    const result = await client.query(
      `SELECT booked_date
       FROM vendor_booked_dates
       WHERE vendor_id = $1
       ORDER BY booked_date ASC`,
      [vendorId]
    );

    await client.query("COMMIT");

    res.json({
      message: "Booked dates saved successfully",
      manual_booked_dates: result.rows.map((row) => row.booked_date),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error saving vendor booked dates:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

app.get("/api/vendor-availability/:vendorId", async (req, res) => {
  try {
    const vendorId = Number(req.params.vendorId);

    const manualBookedResult = await pool.query(
      `SELECT booked_date
       FROM vendor_booked_dates
       WHERE vendor_id = $1
       ORDER BY booked_date ASC`,
      [vendorId]
    );

    const inquiryBookedResult = await pool.query(
      `SELECT DISTINCT event_date
       FROM inquiries
       WHERE vendor_id = $1
       ORDER BY event_date ASC`,
      [vendorId]
    );

    res.json({
      booked_dates: [
        ...manualBookedResult.rows.map((row) => row.booked_date),
        ...inquiryBookedResult.rows.map((row) => row.event_date),
      ],
    });
  } catch (error) {
    console.error("Error fetching vendor availability:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/inquiries", async (req, res) => {
  try {
    const { customer_id, vendor_id, event_date, message } = req.body;

    if (!customer_id || !vendor_id || !event_date || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({ message: "Message should be at least 10 characters" });
    }

    const bookedResult = await pool.query(
      `SELECT id
       FROM inquiries
       WHERE vendor_id = $1 AND event_date = $2
       UNION
       SELECT id
       FROM vendor_booked_dates
       WHERE vendor_id = $1 AND booked_date = $2`,
      [vendor_id, event_date]
    );

    if (bookedResult.rows.length > 0) {
      return res.status(409).json({ message: "This date is already booked" });
    }

    const result = await pool.query(
      `INSERT INTO inquiries (customer_id, vendor_id, event_date, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [customer_id, vendor_id, event_date, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating inquiry:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/inquiries/vendor/:vendorId", async (req, res) => {
  try {
    const vendorId = Number(req.params.vendorId);

    const result = await pool.query(
      `SELECT inquiries.*, users.name AS customer_name, users.email AS customer_email
       FROM inquiries
       JOIN users ON inquiries.customer_id = users.id
       WHERE inquiries.vendor_id = $1
       ORDER BY inquiries.created_at DESC`,
      [vendorId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching vendor inquiries:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/inquiries/customer/:customerId", async (req, res) => {
  try {
    const customerId = Number(req.params.customerId);

    const result = await pool.query(
      `SELECT inquiries.*, vendors.business_name, vendors.location
       FROM inquiries
       JOIN vendors ON inquiries.vendor_id = vendors.id
       WHERE inquiries.customer_id = $1
       ORDER BY inquiries.created_at DESC`,
      [customerId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching customer inquiries:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/inquiries/:id/status", async (req, res) => {
  try {
    const inquiryId = Number(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    if (status !== "new" && status !== "viewed" && status !== "replied") {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await pool.query(
      `UPDATE inquiries
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, inquiryId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password should be at least 6 characters" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Email must contain @" });
    }

    if (role !== "customer" && role !== "vendor") {
      return res.status(400).json({ message: "Invalid role" });
    }

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, password, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error registering user:", error);

    if (error.code === "23505") {
      return res.status(409).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Email must contain @" });
    }

    const result = await pool.query(
      `SELECT id, name, email, role
       FROM users
       WHERE email = $1 AND password_hash = $2`,
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
