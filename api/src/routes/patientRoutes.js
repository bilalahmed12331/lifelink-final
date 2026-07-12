const express = require('express');
const router = express.Router();
const { getMyRequests, submitRequest, getDonors } = require('../controllers/patientController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/my-requests', auth, requireRole('patient'), getMyRequests);
router.post('/request', auth, requireRole('patient'), submitRequest);
router.get('/donors', auth, requireRole('patient'), getDonors);

module.exports = router;
