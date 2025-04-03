/**
 * @file helpers.js
 * @description Utility helper functions for creating daily logs and authenticating users.
 */
const DailyLog = require('../models/DailyLog');
const User = require('../models/User');
const bcrypt = require('bcrypt');

/**
 * @function createDailyLog
 * @async
 * @description Creates a new DailyLog document for a given user and date.
 * @param {string} userId - The user's MongoDB ObjectId.
 * @param {Date|null} [date=null] - The target date for the log. Defaults to today if not provided.
 * @param {Array<string>} foodIds - Array of ObjectIds for foods to include in the log.
 * @returns {Promise<Object>} The newly created DailyLog document.
 */
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

/**
 * @function authenticateUser
 * @async
 * @description Authenticates a user by username and password.
 * @param {string} username - The user's username.
 * @param {string} password - The plain-text password to validate.
 * @returns {Promise<Object|null>} The authenticated user object, or null if authentication fails.
 */
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

