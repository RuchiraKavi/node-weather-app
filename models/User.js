const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    location: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
        city: { type: String }
    },
    weatherData: [
        {
            date: { type: Date, default: Date.now },
            report: String
        }
    ]
});

module.exports = mongoose.model("User", UserSchema);
