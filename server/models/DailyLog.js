/**
 * @file DailyLog.js
 * @description Mongoose model for tracking a user's daily food log.
 */
const { Schema, model } = require("mongoose");
const { DateTime } = require("luxon");

/**
 * @constant dailyLogSchema
 * @type {Schema}
 * @description Schema representing a daily food log entry.
 * Each log belongs to one user and can contain multiple food items for a specific day.
 */
const dailyLogSchema = new Schema(
    {
        /**
         * @property {ObjectId} user_id - Reference to the User who owns this log.
         */
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        /**
        * @property {Date} dateCreated - Represents the specific calendar day of the log.
        * The time is normalized to midnight ET to make querying by day easier.
        */
        dateCreated: {
            type: Date,
            required: true,
            set: function(date) {
                // If it's a string, assume it's in yyyy-MM-dd format
                if (typeof date === 'string') {
                    return DateTime.fromFormat(date, 'yyyy-MM-dd', { zone: 'America/New_York' })
                        .startOf('day')
                        .toJSDate();
                }
                
                // If it's already a Date, convert to Luxon DateTime in ET
                return DateTime.fromJSDate(date, { zone: 'America/New_York' })
                    .startOf('day')
                    .toJSDate();
            }
        },
        /**
         * @property {ObjectId[]} foods - Array of references to OneFood items logged on that day.
         */
        foods: [{
            type: Schema.Types.ObjectId,
            ref: 'OneFood'
        }],
    }
);

/**
 * @description Compound index to efficiently query logs by user and date.
 */
dailyLogSchema.index({
    user_id: 1,
    dateCreated: 1
});

/**
 * @constant DailyLog
 * @type {Model}
 * @description Mongoose model for the DailyLog collection.
 */
const DailyLog = model('DailyLog', dailyLogSchema);

module.exports = DailyLog;