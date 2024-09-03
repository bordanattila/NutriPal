const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signInToken } = require("../utils/auth");

const resolvers = {
    Query: {
        user: async (parent, args, context) => {
            // check if user exist. if not throw error
            if (!context.user) {
              throw new AuthenticationError('You need to be logged in!');
            }
            // if the user exist retrieve it's data
            const userData = await User.findById(context.user._id)
              .select('-__v -password');
            return userData;
          },
    },

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
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
            const user = await User.create({ username, email, password });
            const token = signInToken(user);
            return { token, user };
        },
    }
}
module.exports = resolvers;

