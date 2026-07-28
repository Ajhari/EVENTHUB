CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  business_name VARCHAR(150) NOT NULL,
  location VARCHAR(100) NOT NULL,
  contact_number VARCHAR(20),
  description TEXT,
  price_range VARCHAR(100),
  food_type VARCHAR(50),
  event_type VARCHAR(100),
  available_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendor_services (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  event_type VARCHAR(100) NOT NULL,
  food_type VARCHAR(50) NOT NULL,
  available_date DATE NOT NULL
);

CREATE TABLE vendor_booked_dates (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  booked_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (vendor_id, booked_date)
);

CREATE TABLE inquiries (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES users(id),
  vendor_id INTEGER REFERENCES vendors(id),
  event_date DATE NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
