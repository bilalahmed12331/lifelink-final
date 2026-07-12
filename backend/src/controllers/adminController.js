const pool = require('../config/db');

const getAllDonors = async (req, res) => {
    try {
        const [donors] = await pool.query(
            'SELECT id, full_name, email, blood_group, city, phone, availability, last_donation, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
            ['donor']
        );
        
        res.json(donors);
    } catch (error) {
        console.error('Get all donors error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllPatients = async (req, res) => {
    try {
        const [patients] = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.city, u.phone, u.created_at, 
             (SELECT COUNT(*) FROM blood_requests WHERE requested_by = u.id) as request_count 
             FROM users u 
             WHERE u.role = ? 
             ORDER BY u.created_at DESC`,
            ['patient']
        );
        
        res.json(patients);
    } catch (error) {
        console.error('Get all patients error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getStats = async (req, res) => {
    try {
        const [totalRequests] = await pool.query('SELECT COUNT(*) as count FROM blood_requests');
        const [openRequests] = await pool.query('SELECT COUNT(*) as count FROM blood_requests WHERE status = ?', ['Open']);
        const [criticalRequests] = await pool.query('SELECT COUNT(*) as count FROM blood_requests WHERE urgency = ?', ['Critical']);
        const [completedRequests] = await pool.query('SELECT COUNT(*) as count FROM blood_requests WHERE status = ?', ['Closed']);
        
        const [totalDonors] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['donor']);
        const [availableDonors] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = ? AND availability = ?', ['donor', 'available']);
        const [unavailableDonors] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = ? AND availability = ?', ['donor', 'unavailable']);
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const [newDonorsThisWeek] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = ? AND created_at >= ?', ['donor', oneWeekAgo]);
        
        const [totalPatients] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['patient']);
        
        const [activePatients] = await pool.query(
            `SELECT COUNT(DISTINCT u.id) as count 
             FROM users u 
             JOIN blood_requests br ON u.id = br.requested_by 
             WHERE u.role = ? AND br.status = ?`,
            ['patient', 'Open']
        );
        
        const [totalPatientRequests] = await pool.query(
            `SELECT COUNT(*) as count 
             FROM blood_requests br 
             JOIN users u ON br.requested_by = u.id 
             WHERE u.role = ?`,
            ['patient']
        );
        
        const [newPatientsThisWeek] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = ? AND created_at >= ?', ['patient', oneWeekAgo]);
        
        res.json({
            totalRequests: totalRequests[0].count,
            openRequests: openRequests[0].count,
            criticalRequests: criticalRequests[0].count,
            completedRequests: completedRequests[0].count,
            totalDonors: totalDonors[0].count,
            availableDonors: availableDonors[0].count,
            unavailableDonors: unavailableDonors[0].count,
            newDonorsThisWeek: newDonorsThisWeek[0].count,
            totalPatients: totalPatients[0].count,
            activePatients: activePatients[0].count,
            totalPatientRequests: totalPatientRequests[0].count,
            newPatientsThisWeek: newPatientsThisWeek[0].count
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const blockUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query(
            'UPDATE users SET is_blocked = TRUE WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User blocked successfully' });
    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllDonors, getAllPatients, getStats, blockUser, deleteUser };
