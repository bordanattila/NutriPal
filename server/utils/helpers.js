const DailyLog = require('../models/DailyLog');
const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports.createDailyLog = async (userId, date = null, foodIds) => {
    const logDate = date ? new Date(new Date(date).setHours(0, 0, 0, 0)) : new Date(new Date().setHours(0, 0, 0, 0)); // If no date is provided, default to today

    const newLog = new DailyLog({
        user_id: userId,
        dateCreated: logDate,
        // Array of ObjectId references to OneFood
        foods: foodIds
    });

    try {
        const savedLog = await newLog.save();
        return savedLog;
    } catch (error) {
        console.error(`Error creating daily log for user ${userId}:`, error);
        throw new Error('Failed to create daily log.');
    }
};

// Helper function to handle user authentication
module.exports.authenticateUser = async (username, password) => {
    try {
        const user = await User.findOne({ username });
        if (!user) return null;

        const isValidPassword = await bcrypt.compare(password.trim(), user.password);
        return isValidPassword ? user : null;
    } catch (error) {
        console.error('Error during authentication:', error);
        throw new Error('Authentication failed');
    }
};

