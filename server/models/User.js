const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const dailyLogSchema = require('./DailyLog');

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: [/.+@.+\..+/, "Must use a valid email address"],
        },
        password: {
            type: String,
            required: true
        },
        daily_log: [{
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
      } catch (error){
        return next(error);
      }
    }
  
    next();
  });
  
  // Method to compare and validate password for logging in
  userSchema.methods.isCorrectPassword = async function (password) {
    // return bcrypt.compare(password, this.password);
    const match = await bcrypt.compare(password, this.password);
    return match;
  };
  
  const User = model('User', userSchema);
  
  module.exports = User