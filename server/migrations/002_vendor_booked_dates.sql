CREATE TABLE IF NOT EXISTS vendor_booked_dates (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  booked_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (vendor_id, booked_date)
);
