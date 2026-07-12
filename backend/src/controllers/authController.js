const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const register = async (req, res) => {
    try {
        const { fullName, username, email, password, phone, dob, address, bloodGroup, gender, role } = req.body;
        
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.query(
            `INSERT INTO users (full_name, username, email, password, phone, date_of_birth, address, blood_group, gender, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [fullName, username, email, hashedPassword, phone, dob, address, bloodGroup, gender, role || 'donor']
        );
        
        const token = jwt.sign(
            { id: result.insertId, email, role: role || 'donor', fullName },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        const [newUser] = await pool.query(
            'SELECT id, full_name, username, email, phone, date_of_birth, address, blood_group, gender, role, city, availability, last_donation, medical_notes, created_at FROM users WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).json({ token, user: newUser[0] });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        if (user.is_blocked) {
            return res.status(403).json({ message: 'Account is blocked' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [admins] = await pool.query(
            'SELECT * FROM admin_accounts WHERE email = ?',
            [email]
        );
        
        if (admins.length === 0) {
            return res.status(400).json({ message: 'Invalid admin credentials' });
        }
        
        const admin = admins[0];
        
        if (admin.password !== password) {
            return res.status(400).json({ message: 'Invalid admin credentials' });
        }
        
        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ token, user: { id: admin.id, email: admin.email, role: 'admin' } });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, full_name, username, email, phone, date_of_birth, address, blood_group, gender, role, city, availability, last_donation, medical_notes, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, adminLogin, getProfile };
