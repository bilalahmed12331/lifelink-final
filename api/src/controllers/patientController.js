const pool = require('../config/db');

const getMyRequests = async (req, res) => {
    try {
        const requests = await pool.query(
            'SELECT * FROM blood_requests WHERE requested_by = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        
        res.json(requests.rows);
    } catch (error) {
        console.error('Get my requests error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const submitRequest = async (req, res) => {
    try {
        const { patientName, bloodGroup, hospital, address, city, units, requiredDate, urgency, contact, notes } = req.body;
        
        const timestamp = Date.now();
        const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const requestCode = `REQ-${timestamp}-${randomDigits}`;
        
        const result = await pool.query(
            `INSERT INTO blood_requests (request_code, requested_by, patient_name, blood_group, hospital, address, city, units, required_date, urgency, contact, notes, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Open') RETURNING id`,
            [requestCode, req.user.id, patientName, bloodGroup, hospital, address, city, units, requiredDate, urgency, contact, notes]
        );
        
        const newRequest = await pool.query(
            'SELECT * FROM blood_requests WHERE id = $1',
            [result.rows[0].id]
        );
        
        res.status(201).json(newRequest.rows[0]);
    } catch (error) {
        console.error('Submit request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getDonors = async (req, res) => {
    try {
        const { bloodGroup, city, availability } = req.query;
        
        let query = 'SELECT id, full_name, blood_group, city, phone, availability FROM users WHERE role = $1';
        const params = ['donor'];
        let paramIndex = 2;
        
        if (bloodGroup) {
            query += ` AND blood_group = $${paramIndex}`;
            params.push(bloodGroup);
            paramIndex++;
        }
        
        if (city) {
            query += ` AND city = $${paramIndex}`;
            params.push(city);
            paramIndex++;
        }
        
        if (availability) {
            query += ` AND availability = $${paramIndex}`;
            params.push(availability);
            paramIndex++;
        }
        
        const donors = await pool.query(query, params);
        
        res.json(donors.rows);
    } catch (error) {
        console.error('Get donors error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getMyRequests, submitRequest, getDonors };
