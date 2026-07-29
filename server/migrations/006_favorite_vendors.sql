CREATE TABLE IF NOT EXISTS favorite_vendors (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES users(id),
  vendor_id INTEGER REFERENCES vendors(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (customer_id, vendor_id)
);
