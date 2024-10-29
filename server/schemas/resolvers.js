const { AuthenticationError } = require("apollo-server-express");
const User = require("../models/User");
const { signInToken } = require("../utils/auth");

const resolvers = {
    Query: {
        user: async (parent, args, context) => {
            // Check if user is still logged in. If not throw error
            if (!context.user) {
              throw new AuthenticationError('You need to be logged in!');
            }
            // If the user exist retrieve it's data
            const userData = await User.findById(context.user._id)
              .select('-__v -password');
            return userData;
          },
          getDailyLog: async (_, { user_id, date }) => {
            return DailyLog.findOne({ user_id, dateCreated: date });
          },
    },

    Mutation: {
        login: async (parent, { username, password }) => {
            const user = await User.findOne({ username });
            if (!user) {
                throw new AuthenticationError("Incorrect credentials");
            }
            const validPassword = await user.isCorrectPassword(password);
            if (!validPassword) {
                throw new AuthenticationError("Incorrect credentials");
            }
            const token = signInToken(user);
            return { token, user };
        },
        signup: async (parent, { username, email, password }) => {
          console.log(username, email, password);
          
          // Check if username or email already exists
          const existingUser  = await User.findOne({ $or: [{ username }, { email }] });
          if (existingUser ) {
            console.error("User already exists:", existingUser);
            throw new Error('Username or email already taken. Please choose a different one.');
          }
    
          const user = new User({ username, email, password });
          try {
            await user.save();
          } catch (error) {
            console.error('Error saving user:', error);
            throw new Error('User  creation failed. Please try again.');
          }
          
          const token = signInToken(user);
          return { token, user };
        },
        createDailyLog: async (_, { user_id, foods }) => {
          const newLog = new DailyLog({
            user_id,
            dateCreated: new Date(),
            foods
          });
          return await newLog.save();
        },
    }
}

module.exports = resolvers;

