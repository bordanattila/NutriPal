const { Schema, model } = require("mongoose");

const dailyLogSchema = new Schema (
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        dateCreated: {
            type: Date,
            required: true,
            set: (date) => new Date(date.setHours(0, 0, 0, 0)), 
        },
        foods: [{
            type: Schema.Types.ObjectId,
            ref: 'OneFood'
        }],
    }
);

// Create a compound index for user_id and date_created
dailyLogSchema.index({ 
    user_id: 1, 
    dateCreated: 1 }, 
);

const DailyLog = model('DailyLog', dailyLogSchema);

module.exports = DailyLog;