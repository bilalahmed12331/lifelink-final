const pool = require('../config/db');

const submitMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        await pool.query(
            'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
            [name, email, message]
        );
        
        res.status(201).json({ message: 'Contact message submitted successfully' });
    } catch (error) {
        console.error('Submit message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { submitMessage };
