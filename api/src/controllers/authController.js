const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const register = async (req, res) => {
    try {
        const { fullName, username, email, password, phone, dob, address, bloodGroup, gender, role } = req.body;
        
        const existingUsers = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        
        if (existingUsers.rows.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            `INSERT INTO users (full_name, username, email, password, phone, date_of_birth, address, blood_group, gender, role) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
            [fullName, username, email, hashedPassword, phone, dob, address, bloodGroup, gender, role || 'donor']
        );
        
        const token = jwt.sign(
            { id: result.rows[0].id, email, role: role || 'donor', fullName },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        const newUser = await pool.query(
            'SELECT id, full_name, username, email, phone, date_of_birth, address, blood_group, gender, role, city, availability, last_donation, medical_notes, created_at FROM users WHERE id = $1',
            [result.rows[0].id]
        );
        
        res.status(201).json({ token, user: newUser.rows[0] });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const users = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (users.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const user = users.rows[0];
        
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
        
        const admins = await pool.query(
            'SELECT * FROM admin_accounts WHERE email = $1',
            [email]
        );
        
        if (admins.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid admin credentials' });
        }
        
        const admin = admins.rows[0];
        
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
        const users = await pool.query(
            'SELECT id, full_name, username, email, phone, date_of_birth, address, blood_group, gender, role, city, availability, last_donation, medical_notes, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        
        if (users.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(users.rows[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, adminLogin, getProfile };
