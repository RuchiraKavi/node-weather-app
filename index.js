require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require("body-parser");
const cron = require('node-cron');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Importing userRoutes (Ensure correct path)
const userRoutes = require('./routes/userRoutes');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
    res.send("Weather API is running!");
});

// Use userRoutes to handle API routes
app.use("/", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Import function to send weather emails (Ensure correct path)
const sendWeatherEmails = require('./services/weatherService');

// Schedule cron job to send emails every 3 hours
cron.schedule('0 */3 * * *', async () => {
    console.log("Sending weather updates...");
    await sendWeatherEmails();
});
