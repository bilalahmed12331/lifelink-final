-- PostgreSQL Schema for Supabase

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100),
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    blood_group VARCHAR(5),
    gender VARCHAR(10),
    role VARCHAR(20) DEFAULT 'donor' CHECK (role IN ('donor', 'patient')),
    city VARCHAR(100),
    availability VARCHAR(20) DEFAULT 'available' CHECK (availability IN ('available', 'unavailable')),
    last_donation DATE,
    medical_notes TEXT,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donation_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    donation_date DATE,
    location VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blood_requests (
    id SERIAL PRIMARY KEY,
    request_code VARCHAR(30) UNIQUE,
    requested_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    patient_name VARCHAR(100),
    blood_group VARCHAR(5),
    hospital VARCHAR(150),
    address TEXT,
    city VARCHAR(100),
    units INTEGER DEFAULT 1,
    required_date DATE,
    urgency VARCHAR(20) DEFAULT 'Medium' CHECK (urgency IN ('Low', 'Medium', 'High', 'Critical')),
    contact VARCHAR(20),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    message TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_accounts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'admin'
);

INSERT INTO admin_accounts (email, password, role) VALUES 
('lifelink123@gmail.com', 'lifelink123', 'admin');
