const pool = require('../config/db');

const getAllRequests = async (req, res) => {
    try {
        const [requests] = await pool.query(
            `SELECT br.*, u.full_name as patient_full_name, u.email as patient_email 
             FROM blood_requests br 
             JOIN users u ON br.requested_by = u.id 
             ORDER BY br.created_at DESC`
        );
        
        res.json(requests);
    } catch (error) {
        console.error('Get all requests error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        
        if (status !== 'Open' && status !== 'Closed') {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        await pool.query(
            'UPDATE blood_requests SET status = ? WHERE id = ?',
            [status, id]
        );
        
        const [updatedRequest] = await pool.query(
            'SELECT * FROM blood_requests WHERE id = ?',
            [id]
        );
        
        if (updatedRequest.length === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }
        
        res.json(updatedRequest[0]);
    } catch (error) {
        console.error('Update request status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query(
            'DELETE FROM blood_requests WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }
        
        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        console.error('Delete request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [requests] = await pool.query(
            `SELECT br.*, u.full_name as patient_full_name, u.email as patient_email, u.phone as patient_phone 
             FROM blood_requests br 
             JOIN users u ON br.requested_by = u.id 
             WHERE br.id = ?`,
            [id]
        );
        
        if (requests.length === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }
        
        res.json(requests[0]);
    } catch (error) {
        console.error('Get request by id error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllRequests, updateRequestStatus, deleteRequest, getRequestById };
