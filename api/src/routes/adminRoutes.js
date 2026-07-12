const express = require('express');
const router = express.Router();
const { getAllDonors, getAllPatients, getStats, blockUser, deleteUser } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/donors', auth, requireRole('admin'), getAllDonors);
router.get('/patients', auth, requireRole('admin'), getAllPatients);
router.get('/stats', auth, requireRole('admin'), getStats);
router.put('/block/:id', auth, requireRole('admin'), blockUser);
router.delete('/user/:id', auth, requireRole('admin'), deleteUser);

module.exports = router;
