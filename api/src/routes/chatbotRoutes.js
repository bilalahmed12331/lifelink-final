const express = require('express');
const router = express.Router();
const { getReply } = require('../controllers/chatbotController');
const auth = require('../middleware/auth');

router.post('/reply', auth, getReply);

module.exports = router;
