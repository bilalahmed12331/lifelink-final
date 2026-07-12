const getReply = (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }
        
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('donate today') || lowerMessage.includes('can i donate') || lowerMessage.includes('eligible today')) {
            return res.json({ reply: 'According to the 90-day rule, you must wait at least 90 days between blood donations. Please check your last donation date to see if you are eligible to donate today.' });
        }
        
        if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('diet') || lowerMessage.includes('nutrition')) {
            return res.json({ reply: 'Before donating blood, eat iron-rich foods like spinach, red meat, beans, and fortified cereals. Avoid fatty foods and drink plenty of water. After donation, eat snacks and drink extra fluids to replenish your body.' });
        }
        
        if (lowerMessage.includes('eligible') || lowerMessage.includes('criteria') || lowerMessage.includes('requirement') || lowerMessage.includes('can donate')) {
            return res.json({ reply: 'To be eligible to donate blood, you must be between 18-65 years old, weigh at least 50kg (110lbs), be in good health, and have no recent illnesses or infections. You should also not have donated blood in the last 90 days.' });
        }
        
        if (lowerMessage.includes('how often') || lowerMessage.includes('frequency') || lowerMessage.includes('how many times')) {
            return res.json({ reply: 'You can donate whole blood every 90 days (3 months). For platelets, you can donate more frequently - every 7 days up to 24 times a year. Always consult with healthcare professionals about your specific situation.' });
        }
        
        if (lowerMessage.includes('benefit') || lowerMessage.includes('why donate') || lowerMessage.includes('advantage')) {
            return res.json({ reply: 'Donating blood saves lives - one donation can help up to 3 patients. Benefits include free health screening, reduced risk of heart disease, burning calories, and the satisfaction of helping others in need.' });
        }
        
        if (lowerMessage.includes('plasma')) {
            return res.json({ reply: 'Plasma donation is the process of collecting the liquid portion of your blood which contains antibodies and proteins. It takes longer than whole blood donation (about 1.5-2 hours) and can be done more frequently (every 28 days). Plasma is used to treat burn victims, trauma patients, and those with immune disorders.' });
        }
        
        if (lowerMessage.includes('blood type') || lowerMessage.includes('compatibility') || lowerMessage.includes('who can receive')) {
            return res.json({ reply: 'Blood type compatibility: O- is the universal donor (can give to all), O+ can give to Rh+ types (A+, B+, AB+, O+), A- can give to A and AB types, A+ can give to A+ and AB+, B- can give to B and AB types, B+ can give to B+ and AB+, AB- can give to AB types only, AB+ is the universal recipient (can receive from all).' });
        }
        
        if (lowerMessage.includes('safe') || lowerMessage.includes('transfusion') || lowerMessage.includes('infection')) {
            return res.json({ reply: 'Blood transfusions are very safe. All donated blood is screened for HIV, hepatitis B and C, syphilis, and other infectious diseases. The equipment used is sterile and disposable, eliminating any risk of infection during donation.' });
        }
        
        if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('critical') || lowerMessage.includes('immediate')) {
            return res.json({ reply: 'For emergency blood requests, please contact your nearest hospital or blood bank immediately. In LifeLink, you can mark your request as "Critical" urgency to highlight its urgency. Call emergency services if the situation is life-threatening.' });
        }
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('greeting')) {
            return res.json({ reply: 'Hello! I am the LifeLink assistant. I can help you with questions about blood donation eligibility, timing, nutrition, blood type compatibility, and more. How can I assist you today?' });
        }
        
        return res.json({ reply: 'I can help you with questions about blood donation eligibility timing, nutrition, blood type compatibility, transfusion safety, and emergency guidance. Please ask a specific question about these topics.' });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getReply };
