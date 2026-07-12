const express = require('express');
const router = express.Router();
const { register, login, adminLogin, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.get('/profile', auth, getProfile);

module.exports = router;
