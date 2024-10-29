const DailyLog = require('../models/DailyLog');

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


