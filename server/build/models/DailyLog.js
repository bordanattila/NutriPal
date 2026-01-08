"use strict";
/**
 * @file DailyLog.js
 * @description Mongoose model for tracking a user's daily food log.
 */
const { Schema, model } = require("mongoose");
/**
 * @constant dailyLogSchema
 * @type {Schema}
 * @description Schema representing a daily food log entry.
 * Each log belongs to one user and can contain multiple food items for a specific day.
 */
const dailyLogSchema = new Schema({
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
    * The time is normalized to 00:00:00 to make querying by day easier.
    */
    dateCreated: {
        type: Date,
        required: true,
        set: (date) => new Date(date.setHours(0, 0, 0, 0)),
    },
    /**
     * @property {ObjectId[]} foods - Array of references to OneFood items logged on that day.
     */
    foods: [{
            type: Schema.Types.ObjectId,
            ref: 'OneFood'
        }],
});
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
