const express = require('express');
const router = express.Router();
const { getAllRequests, updateRequestStatus, deleteRequest, getRequestById } = require('../controllers/requestController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/', auth, requireRole('admin'), getAllRequests);
router.get('/:id', auth, requireRole('admin'), getRequestById);
router.put('/:id/status', auth, requireRole('admin'), updateRequestStatus);
router.delete('/:id', auth, requireRole('admin'), deleteRequest);

module.exports = router;
