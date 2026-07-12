const pool = require('../config/db');

const getDashboard = async (req, res) => {
    try {
        const users = await pool.query(
            'SELECT id, full_name, blood_group, availability, last_donation FROM users WHERE id = $1',
            [req.user.id]
        );
        
        if (users.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const user = users.rows[0];
        
        let daysUntilEligible = null;
        if (user.last_donation) {
            const lastDonationDate = new Date(user.last_donation);
            const eligibleDate = new Date(lastDonationDate);
            eligibleDate.setDate(eligibleDate.getDate() + 90);
            const today = new Date();
            const diffTime = eligibleDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            daysUntilEligible = diffDays > 0 ? diffDays : 0;
        }
        
        const history = await pool.query(
            'SELECT id, donation_date, location, created_at FROM donation_history WHERE user_id = $1 ORDER BY donation_date DESC',
            [req.user.id]
        );
        
        res.json({
            user: {
                ...user,
                daysUntilEligible
            },
            donationHistory: history.rows
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateDonationInfo = async (req, res) => {
    try {
        const { bloodGroup, city, phone, lastDonation, availability, medicalNotes } = req.body;
        
        const currentUser = await pool.query(
            'SELECT last_donation FROM users WHERE id = $1',
            [req.user.id]
        );
        
        if (currentUser.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const currentLastDonation = currentUser.rows[0].last_donation;
        
        await pool.query(
            `UPDATE users SET blood_group = $1, city = $2, phone = $3, last_donation = $4, availability = $5, medical_notes = $6 
             WHERE id = $7`,
            [bloodGroup, city, phone, lastDonation, availability, medicalNotes, req.user.id]
        );
        
        if (lastDonation && lastDonation !== currentLastDonation) {
            await pool.query(
                'INSERT INTO donation_history (user_id, donation_date, location) VALUES ($1, $2, $3)',
                [req.user.id, lastDonation, city || '']
            );
        }
        
        const updatedUser = await pool.query(
            'SELECT id, full_name, blood_group, city, phone, availability, last_donation, medical_notes FROM users WHERE id = $1',
            [req.user.id]
        );
        
        res.json(updatedUser.rows[0]);
    } catch (error) {
        console.error('Update donation info error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateAvailabilityOnly = async (req, res) => {
    try {
        const currentUser = await pool.query(
            'SELECT availability FROM users WHERE id = $1',
            [req.user.id]
        );
        
        if (currentUser.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const currentAvailability = currentUser.rows[0].availability;
        const newAvailability = currentAvailability === 'available' ? 'unavailable' : 'available';
        
        await pool.query(
            'UPDATE users SET availability = $1 WHERE id = $2',
            [newAvailability, req.user.id]
        );
        
        res.json({ availability: newAvailability });
    } catch (error) {
        console.error('Update availability error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getDonationHistory = async (req, res) => {
    try {
        const history = await pool.query(
            'SELECT id, donation_date, location, created_at FROM donation_history WHERE user_id = $1 ORDER BY donation_date DESC',
            [req.user.id]
        );
        
        res.json(history.rows);
    } catch (error) {
        console.error('Get donation history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getDashboard, updateDonationInfo, updateAvailabilityOnly, getDonationHistory };
