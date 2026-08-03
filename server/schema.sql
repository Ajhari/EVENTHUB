CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'vendor')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id),
  business_name TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_number TEXT,
  description TEXT,
  price_range TEXT,
  food_type TEXT,
  event_type TEXT,
  available_date DATE,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendor_services (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  event_type TEXT NOT NULL,
  food_type TEXT NOT NULL,
  available_date DATE NOT NULL,
  UNIQUE (vendor_id, event_type, food_type, available_date)
);

CREATE TABLE IF NOT EXISTS vendor_booked_dates (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  booked_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (vendor_id, booked_date)
);

CREATE TABLE IF NOT EXISTS favorite_vendors (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES users(id),
  vendor_id INTEGER REFERENCES vendors(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (customer_id, vendor_id)
);

CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES users(id),
  vendor_id INTEGER REFERENCES vendors(id),
  event_date DATE NOT NULL,
  message TEXT NOT NULL,
  vendor_reply TEXT,
  replied_at TIMESTAMP,
  customer_reply TEXT,
  customer_replied_at TIMESTAMP,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE inquiries
ADD COLUMN IF NOT EXISTS vendor_reply TEXT;

ALTER TABLE inquiries
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP;

ALTER TABLE inquiries
ADD COLUMN IF NOT EXISTS customer_reply TEXT;

ALTER TABLE inquiries
ADD COLUMN IF NOT EXISTS customer_replied_at TIMESTAMP;
