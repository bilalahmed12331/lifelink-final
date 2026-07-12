const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const donorRoutes = require('./src/routes/donorRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const requestRoutes = require('./src/routes/requestRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const chatbotRoutes = require('./src/routes/chatbotRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://127.0.0.1:5500'
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        name: 'LifeLink API',
        status: 'ok'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/contact', contactRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`LifeLink API server running on port ${PORT}`);
});
