/**
 * @file User.js
 * @description Mongoose model for application users, including authentication logic.
 */
const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const dailyLogSchema = require('./DailyLog');

/**
 * @constant userSchema
 * @type {Schema}
 * @description Schema representing user accounts.
 */
const userSchema = new Schema(
  {
    /**
     * @property {String} username - Unique username.
     */
    username: {
      type: String,
      required: true,
      unique: true
    },

    /**
    * @property {String} email - User's email address.
    */
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, "Must use a valid email address"],
    },

    /**
    * @property {String} password - Hashed password.
    */
    password: {
      type: String,
      required: false
    },

    /**
    * @property {Number} calorieGoal - Daily calorie goal set by the user (optional).
    */
    calorieGoal: {
      type: Number,
      required: false
    },

    /**
    * @property {String} profilePic - Optional profile picture URL.
    */
    profilePic: {
      type: String,
      required: false
    },

    /**
    * @property {ObjectId[]} dailyLog - Food items logged by user for the day.
    */
    daily_log: [{
      type: Schema.Types.ObjectId,
      ref: 'DailyLog'
    }],

    /**
    * @property {ObjectId[]} recipe - Recipe logged by user.
    */
    recipe: [{
      type: Schema.Types.ObjectId,
      ref: 'DailyLog'
    }],
  }
);

// Hash user password
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    try {
      this.password = await bcrypt.hash(this.password, saltRounds);
    } catch (error) {
      return next(error);
    }
  }

  next();
});

/**
* @function isCorrectPassword
* @description Validates password input against hashed value in DB.
* @param {String} password
* @returns {Boolean}
*/
userSchema.methods.isCorrectPassword = async function (password) {
  // return bcrypt.compare(password, this.password);
  const match = await bcrypt.compare(password, this.password);
  return match;
};

/**
* @constant User
* @type {Model}
* @description Mongoose model for the User collection.
*/
const User = model('User', userSchema);

module.exports = User