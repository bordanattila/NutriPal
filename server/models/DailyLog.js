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
            default: Date.now,
            // unique: true,
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
    date_created: 1 }, 
    { unique: true }
);

const DailyLog = model('DailyLog', dailyLogSchema);

module.exports = DailyLog;