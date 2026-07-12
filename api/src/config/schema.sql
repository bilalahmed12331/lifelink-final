CREATE DATABASE IF NOT EXISTS lifelink;
USE lifelink;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100),
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    blood_group VARCHAR(5),
    gender VARCHAR(10),
    role ENUM('donor', 'patient') DEFAULT 'donor',
    city VARCHAR(100),
    availability ENUM('available', 'unavailable') DEFAULT 'available',
    last_donation DATE,
    medical_notes TEXT,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donation_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    donation_date DATE,
    location VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blood_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_code VARCHAR(30) UNIQUE,
    requested_by INT,
    patient_name VARCHAR(100),
    blood_group VARCHAR(5),
    hospital VARCHAR(150),
    address TEXT,
    city VARCHAR(100),
    units INT DEFAULT 1,
    required_date DATE,
    urgency ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    contact VARCHAR(20),
    notes TEXT,
    status ENUM('Open', 'Closed') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    message TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'admin'
);

INSERT INTO admin_accounts (email, password, role) VALUES 
('lifelink123@gmail.com', 'lifelink123', 'admin');
