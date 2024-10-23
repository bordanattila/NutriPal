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
            const user = new User({ username, email, password });
            await user.save();
            const token = signInToken(user);
            return { token, user };
          },
    }
}

module.exports = resolvers;

