const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { initializeDatabase, pool } = require("./db");

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
let databaseReadyPromise;

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads", "vendor-images");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

function getDatabaseReadyPromise() {
  if (!databaseReadyPromise) {
    databaseReadyPromise = initializeDatabase();
  }

  return databaseReadyPromise;
}

app.use(async (req, res, next) => {
  try {
    await getDatabaseReadyPromise();
    next();
  } catch (error) {
    console.error("Database setup failed:", error.message);
    res.status(500).json({ message: "Database setup failed" });
  }
});

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const safeExtension = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, and WebP images are allowed"));
    }

    return cb(null, true);
  },
});

function uploadVendorImage(req, res, next) {
  upload.single("vendor_image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return next();
  });
}

function deleteUploadedVendorImage(imagePath) {
  if (!imagePath || !imagePath.startsWith("/uploads/vendor-images/")) {
    return;
  }

  const imageFileName = path.basename(imagePath);
  const imageFilePath = path.join(uploadsDir, imageFileName);

  fs.unlink(imageFilePath, (error) => {
    if (error && error.code !== "ENOENT") {
      console.error("Error deleting vendor image file:", error);
    }
  });
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
});

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in server/.env");
}

const isProduction = process.env.NODE_ENV === "production";
const authCookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const headerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const token = req.cookies.eventhubToken || headerToken;

  if (!token) {
    return res.status(401).json({ message: "Login token is required" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "You do not have permission" });
    }

    return next();
  };
}

function requireSameUserParam(paramName) {
  return (req, res, next) => {
    if (Number(req.params[paramName]) !== Number(req.user.id)) {
      return res.status(403).json({ message: "You can only access your own data" });
    }

    return next();
  };
}

async function requireVendorOwner(req, res, next) {
  try {
    const vendorId = Number(req.params.id || req.params.vendorId);
    const result = await pool.query("SELECT user_id FROM vendors WHERE id = $1", [vendorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    if (Number(result.rows[0].user_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: "You can only manage your own vendor profile" });
    }

    return next();
  } catch (error) {
    console.error("Error checking vendor owner:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function requireVendorBodyOwner(req, res, next) {
  try {
    const vendorId = Number(req.body.vendor_id);

    if (!vendorId) {
      return res.status(400).json({ message: "Vendor is required" });
    }

    const result = await pool.query("SELECT user_id FROM vendors WHERE id = $1", [vendorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    if (Number(result.rows[0].user_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: "You can only manage your own vendor profile" });
    }

    return next();
  } catch (error) {
    console.error("Error checking vendor owner:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function requireInquiryVendorOwner(req, res, next) {
  try {
    const inquiryId = Number(req.params.id);

    const result = await pool.query(
      `SELECT vendors.user_id
       FROM inquiries
       JOIN vendors ON inquiries.vendor_id = vendors.id
       WHERE inquiries.id = $1`,
      [inquiryId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    if (Number(result.rows[0].user_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: "You can only update inquiries for your vendor profile" });
    }

    return next();
  } catch (error) {
    console.error("Error checking inquiry owner:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

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

app.get("/api/vendors/user/:userId", authenticateToken, requireRole("vendor"), requireSameUserParam("userId"), async (req, res) => {
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

app.post("/api/vendors", authenticateToken, requireRole("vendor"), uploadVendorImage, async (req, res) => {
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

    if (Number(user_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: "You can only create your own vendor profile" });
    }

    const digitsOnlyContact = contact_number ? contact_number.replace(/\D/g, "") : "";
    const profileAvailableDate = available_date || null;
    const uploadedImagePath = req.file ? `/uploads/vendor-images/${req.file.filename}` : null;
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
        available_date,
        image_url
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
        uploadedImagePath,
      ]
    );

    res.status(201).json(formatVendor(result.rows[0]));
  } catch (error) {
    console.error("Error creating vendor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/vendors/:id", authenticateToken, requireRole("vendor"), requireVendorOwner, uploadVendorImage, async (req, res) => {
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
    const uploadedImagePath = req.file ? `/uploads/vendor-images/${req.file.filename}` : null;
    const normalizedBusinessName = uppercaseText(business_name);
    const normalizedLocation = uppercaseText(location);
    const normalizedDescription = uppercaseText(description);
    const normalizedPriceRange = uppercaseText(price_range);
    const normalizedFoodType = uppercaseText(food_type);
    const normalizedEventType = uppercaseText(event_type);

    if (contact_number && digitsOnlyContact.length < 10) {
      return res.status(400).json({ message: "Contact number should have at least 10 digits" });
    }

    const existingVendor = await pool.query(
      "SELECT image_url FROM vendors WHERE id = $1",
      [vendorId]
    );

    const result = await pool.query(
      `UPDATE vendors
       SET business_name = $1,
           location = $2,
           contact_number = $3,
           description = $4,
           price_range = $5,
           food_type = $6,
           event_type = $7,
           available_date = $8,
           image_url = COALESCE($9, image_url)
       WHERE id = $10
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
        uploadedImagePath,
        vendorId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    if (uploadedImagePath && existingVendor.rows[0]?.image_url) {
      deleteUploadedVendorImage(existingVendor.rows[0].image_url);
    }

    res.json(formatVendor(result.rows[0]));
  } catch (error) {
    console.error("Error updating vendor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/vendors/:id/image", authenticateToken, requireRole("vendor"), requireVendorOwner, async (req, res) => {
  try {
    const vendorId = Number(req.params.id);

    const existingVendor = await pool.query(
      "SELECT image_url FROM vendors WHERE id = $1",
      [vendorId]
    );

    if (existingVendor.rows.length === 0) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    const result = await pool.query(
      `UPDATE vendors
       SET image_url = NULL
       WHERE id = $1
       RETURNING *`,
      [vendorId]
    );

    deleteUploadedVendorImage(existingVendor.rows[0].image_url);

    res.json(formatVendor(result.rows[0]));
  } catch (error) {
    console.error("Error deleting vendor image:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/vendors/:id", authenticateToken, requireRole("vendor"), requireVendorOwner, async (req, res) => {
  const client = await pool.connect();

  try {
    const vendorId = Number(req.params.id);
    const existingVendor = await client.query(
      "SELECT image_url FROM vendors WHERE id = $1",
      [vendorId]
    );

    await client.query("BEGIN");
    await client.query("DELETE FROM vendor_services WHERE vendor_id = $1", [vendorId]);
    await client.query("DELETE FROM vendor_booked_dates WHERE vendor_id = $1", [vendorId]);
    await client.query("DELETE FROM favorite_vendors WHERE vendor_id = $1", [vendorId]);
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
    deleteUploadedVendorImage(existingVendor.rows[0]?.image_url);
    res.json({ message: "Vendor profile deleted successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting vendor profile:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

app.get("/api/favorites/:customerId", authenticateToken, requireRole("customer"), requireSameUserParam("customerId"), async (req, res) => {
  try {
    const customerId = Number(req.params.customerId);

    const result = await pool.query(
      `SELECT vendors.*, favorite_vendors.created_at AS favorited_at
       FROM favorite_vendors
       JOIN vendors ON favorite_vendors.vendor_id = vendors.id
       WHERE favorite_vendors.customer_id = $1
       ORDER BY favorite_vendors.created_at DESC`,
      [customerId]
    );

    res.json(result.rows.map(formatVendor));
  } catch (error) {
    console.error("Error fetching favorite vendors:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/favorites/:customerId/:vendorId", authenticateToken, requireRole("customer"), requireSameUserParam("customerId"), async (req, res) => {
  try {
    const customerId = Number(req.params.customerId);
    const vendorId = Number(req.params.vendorId);

    const result = await pool.query(
      `SELECT id
       FROM favorite_vendors
       WHERE customer_id = $1 AND vendor_id = $2`,
      [customerId, vendorId]
    );

    res.json({ is_favorite: result.rows.length > 0 });
  } catch (error) {
    console.error("Error checking favorite vendor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/favorites", authenticateToken, requireRole("customer"), async (req, res) => {
  try {
    const { customer_id, vendor_id } = req.body;

    if (!customer_id || !vendor_id) {
      return res.status(400).json({ message: "Customer and vendor are required" });
    }

    if (Number(customer_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: "You can only save your own favorites" });
    }

    await pool.query(
      `INSERT INTO favorite_vendors (customer_id, vendor_id)
       VALUES ($1, $2)
       ON CONFLICT (customer_id, vendor_id) DO NOTHING`,
      [customer_id, vendor_id]
    );

    res.status(201).json({
      message: "Vendor added to favorites",
    });
  } catch (error) {
    console.error("Error adding favorite vendor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/favorites/:customerId/:vendorId", authenticateToken, requireRole("customer"), requireSameUserParam("customerId"), async (req, res) => {
  try {
    const customerId = Number(req.params.customerId);
    const vendorId = Number(req.params.vendorId);

    await pool.query(
      `DELETE FROM favorite_vendors
       WHERE customer_id = $1 AND vendor_id = $2`,
      [customerId, vendorId]
    );

    res.json({ message: "Vendor removed from favorites" });
  } catch (error) {
    console.error("Error removing favorite vendor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/vendor-services", authenticateToken, requireRole("vendor"), requireVendorBodyOwner, async (req, res) => {
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

app.post("/api/vendor-services/range", authenticateToken, requireRole("vendor"), requireVendorBodyOwner, async (req, res) => {
  const client = await pool.connect();

  try {
    const { vendor_id, event_type, food_type, start_date, end_date } = req.body;

    if (!vendor_id || !event_type || !food_type || !start_date || !end_date) {
      return res.status(400).json({ message: "All service range fields are required" });
    }

    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ message: "Start date cannot be after end date" });
    }

    await client.query("BEGIN");
    const services = [];
    const currentDate = new Date(`${start_date}T00:00:00Z`);
    const finalDate = new Date(`${end_date}T00:00:00Z`);

    while (currentDate <= finalDate) {
      const availableDate = currentDate.toISOString().slice(0, 10);
      const unavailable = await client.query(
        `SELECT id FROM inquiries WHERE vendor_id = $1 AND event_date = $2
         UNION
         SELECT id FROM vendor_services
         WHERE vendor_id = $1 AND event_type = $3 AND food_type = $4 AND available_date = $2`,
        [vendor_id, availableDate, event_type, food_type]
      );

      if (unavailable.rows.length === 0) {
        const inserted = await client.query(
          `INSERT INTO vendor_services (vendor_id, event_type, food_type, available_date)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [vendor_id, event_type, food_type, availableDate]
        );
        services.push(inserted.rows[0]);
      }
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    await client.query("COMMIT");

    res.status(201).json({
      message: `${services.length} available dates saved`,
      services,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error adding vendor service date range:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
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

app.get("/api/vendor-booked-dates/:vendorId", authenticateToken, requireRole("vendor"), requireVendorOwner, async (req, res) => {
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

app.put("/api/vendor-booked-dates/:vendorId", authenticateToken, requireRole("vendor"), requireVendorOwner, async (req, res) => {
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

app.post("/api/inquiries", authenticateToken, requireRole("customer"), async (req, res) => {
  try {
    const { customer_id, vendor_id, event_date, message } = req.body;

    if (!customer_id || !vendor_id || !event_date || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (Number(customer_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: "You can only send inquiries from your own account" });
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

app.get("/api/inquiries/vendor/:vendorId", authenticateToken, requireRole("vendor"), requireVendorOwner, async (req, res) => {
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

app.get("/api/inquiries/customer/:customerId", authenticateToken, requireRole("customer"), requireSameUserParam("customerId"), async (req, res) => {
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

app.put("/api/inquiries/:id/status", authenticateToken, requireRole("vendor"), requireInquiryVendorOwner, async (req, res) => {
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

app.post("/api/auth/register", authLimiter, async (req, res) => {
  try {
    const { name, password, role } = req.body;
    const email = String(req.body.email || "").trim().toLowerCase();

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, role]
    );

    const user = result.rows[0];

    const token = createToken(user);

    res.cookie("eventhubToken", token, authCookieOptions);
    res.status(201).json({ user });
  } catch (error) {
    console.error("Error registering user:", error);

    if (error.code === "23505") {
      return res.status(409).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "").trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Email must contain @" });
    }

    const result = await pool.query(
      `SELECT id, name, email, password_hash, role
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const savedPassword = result.rows[0].password_hash;
    const isBcryptHash = savedPassword.startsWith("$2");
    const passwordMatches = isBcryptHash
      ? await bcrypt.compare(password, savedPassword)
      : password === savedPassword;

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!isBcryptHash) {
      const upgradedPasswordHash = await bcrypt.hash(password, 10);
      await pool.query(
        "UPDATE users SET password_hash = $1 WHERE id = $2",
        [upgradedPasswordHash, result.rows[0].id]
      );
    }

    const user = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      role: result.rows[0].role,
    };

    const token = createToken(user);

    res.cookie("eventhubToken", token, authCookieOptions);
    res.json({ user });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("eventhubToken", {
    httpOnly: true,
    sameSite: authCookieOptions.sameSite,
    secure: authCookieOptions.secure,
  });
  res.json({ message: "Logged out successfully" });
});

const PORT = process.env.PORT || 3001;

if (!process.env.VERCEL) {
  getDatabaseReadyPromise()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Database setup failed:", error.message);
      process.exit(1);
    });
}

module.exports = app;
