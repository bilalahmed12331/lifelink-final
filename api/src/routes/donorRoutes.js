const express = require('express');
const router = express.Router();
const { getDashboard, updateDonationInfo, updateAvailabilityOnly, getDonationHistory } = require('../controllers/donorController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/dashboard', auth, requireRole('donor'), getDashboard);
router.put('/donation-info', auth, requireRole('donor'), updateDonationInfo);
router.put('/availability', auth, requireRole('donor'), updateAvailabilityOnly);
router.get('/history', auth, requireRole('donor'), getDonationHistory);

module.exports = router;
