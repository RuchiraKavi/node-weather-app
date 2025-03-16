const axios = require('axios');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const fetchWeather = async (lat, lon) => {
    const API_KEY = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const response = await axios.get(url);
    return response.data;
};

const sendWeatherEmails = async () => {
    const users = await User.find();
    users.forEach(async user => {
        const weatherData = await fetchWeather(user.location.lat, user.location.lon);

        // Store weather data
        user.weatherData.push({ report: `Temp: ${weatherData.main.temp}°C, ${weatherData.weather[0].description}` });
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

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log(error);
            else console.log(`Email sent: ${info.response}`);
        });
    });
};

module.exports = sendWeatherEmails;
