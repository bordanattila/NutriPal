/**
 * @file connection.js
 * @description Establishes a connection to the MongoDB database using Mongoose.
 * Uses the URI specified in the environment variable `MONGODB_URI`, or falls back
 * to a local MongoDB instance (`mongodb://127.0.0.1:27017/food_tracker`) by default.
 *
 * @requires mongoose
 *
 * @example
 * // Typically imported once in your server entry point
 * const db = require('./config/connection');
 */
const mongoose = require('mongoose');

/**
 * Connects to MongoDB using Mongoose.
 * If `process.env.MONGODB_URI` is not defined, uses the local default URI.
 */
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/food_tracker?directConnection=true')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

/**
 * @exports mongoose.connection - The Mongoose connection instance,
 * which can be used for monitoring or closing the connection manually.
 */
module.exports = mongoose.connection;