const axios = require('axios');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const fetchWeather = async (lat, lon) => {
    try {
        const API_KEY = process.env.WEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching weather data:", error.message);
        return null; // Return null in case of failure
    }
};

const sendWeatherEmails = async () => {
    try {
        const users = await User.find();

        for (const user of users) {
            if (!user.location || !user.location.lat || !user.location.lon) {
                console.warn(`Skipping user ${user.email} due to missing location.`);
                continue;
            }

            const weatherData = await fetchWeather(user.location.lat, user.location.lon);
            if (!weatherData) continue; // Skip if weather API fails

            // Store weather data with date
            user.weatherData.push({
                report: `Temp: ${weatherData.main.temp}°C, ${weatherData.weather[0].description}`,
                date: new Date().toISOString().split('T')[0] // Store date as YYYY-MM-DD
            });

            await user.save();

            // Send email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Hourly Weather Update",
                text: `Hello, the weather at your location is: ${weatherData.main.temp}°C, ${weatherData.weather[0].description}`
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${user.email}: ${info.response}`);
            } catch (emailError) {
                console.error(`Error sending email to ${user.email}:`, emailError.message);
            }
        }
    } catch (error) {
        console.error("Error in sendWeatherEmails:", error.message);
    }
};

module.exports = sendWeatherEmails;
