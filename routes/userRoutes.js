const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Add a new user
router.post('/add', async (req, res) => {
    const { email, lat, lon } = req.body;
    try {
        const user = new User({ email, location: { lat, lon } });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: "Error adding user" });
    }
});

module.exports = router;

router.put('/update-location', async (req, res) => {
    const { email, lat, lon } = req.body;
    try {
        const user = await User.findOneAndUpdate({ email }, { location: { lat, lon } }, { new: true });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Error updating location" });
    }
});

router.get('/weather/:email/:date', async (req, res) => {
    const { email, date } = req.params;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const weatherData = user.weatherData.filter(data => 
            new Date(data.date).toISOString().split('T')[0] === date
        );

        res.json(weatherData);
    } catch (error) {
        res.status(500).json({ error: "Error retrieving weather data" });
    }
});
