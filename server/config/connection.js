const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/food_tracker?directConnection=true');

module.exports = mongoose.connection;