"use strict";
/**
 * @file resolvers.js
 * @description GraphQL resolvers for queries and mutations related to users, logs, and recipes.
 */
const { AuthenticationError } = require("apollo-server-express");
const User = require("../models/User");
const { signInToken } = require("../utils/auth");
const DailyLog = require("../models/DailyLog");
const resolvers = {
    /**
     * @type {Query}
     * @description Handles all GraphQL queries
     */
    Query: {
        /**
         * @route GET /graphql -> user
         * @desc Returns the authenticated user's data
         * @access Private
         */
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
        /**
         * @route GET /graphql -> getDailyLog
         * @desc Retrieves a user's daily log by user_id and date
         * @access Private
         */
        getDailyLog: async (_, { user_id, date }) => {
            return DailyLog.findOne({ user_id, dateCreated: date });
        },
        /**
         * @route GET /graphql -> getOneFood
         * @desc Fetches a single logged food item by user_id and food_id
         * @access Private
         */
        getOneFood: async (_, { user_id, food_id }) => {
            return OneFood.findOne({ _id: food_id, user_id, created });
        }
    },
    /**
     * @type {Mutation}
     * @description Handles all GraphQL mutations
     */
    Mutation: {
        /**
         * @route POST /graphql -> login
         * @desc Authenticates a user and returns a signed JWT
         * @access Public
         */
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
        /**
         * @route POST /graphql -> signup
         * @desc Registers a new user
         * @access Public
         */
        signup: async (parent, { username, email, password }) => {
            // Check if username or email already exists
            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                console.error("User already exists:", existingUser);
                throw new Error('Username or email already taken. Please choose a different one.');
            }
            const user = new User({ username, email, password });
            try {
                await user.save();
            }
            catch (error) {
                console.error('Error saving user:', error);
                throw new Error('User  creation failed. Please try again.');
            }
            const token = signInToken(user);
            return { token, user };
        },
        /**
         * @route POST /graphql -> createDailyLog
         * @desc Creates a new daily log with selected foods
         * @access Private
         */
        createDailyLog: async (_, { user_id, foods }) => {
            const newLog = new DailyLog({
                user_id,
                dateCreated: new Date(),
                foods
            });
            return await newLog.save();
        },
        /**
         * @route POST /graphql -> updateUserProfile
         * @desc Updates a user's profile details (password, calorie goal, profile pic)
         * @access Private
         */
        updateUserProfile: async (_, { userId, calorieGoal, password, profilePic }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Update fields if provided
            if (calorieGoal !== undefined && calorieGoal !== null) {
                user.calorieGoal = calorieGoal;
            }
            if (password) {
                user.password = password; // Schema will hash the password
            }
            if (profilePic) {
                user.profilePic = profilePic;
            }
            await user.save(); // Trigger pre('save') middleware
            return user;
        },
        /**
         * @route POST /graphql -> createRecipe
         * @desc Saves a custom recipe based on OneFood entries
         * @access Private
         */
        createRecipe: async (_, { user_id, recipeName, ingredients, servingSize, nutrition }) => {
            const recipe = new Recipe({
                user_id,
                recipeName,
                ingredients,
                servingSize,
                nutrition,
            });
            return await recipe.save();
        },
        /**
         * @route DELETE /graphql -> deleteOneFood
         * @desc Deletes a food entry from a user's daily log
         * @access Private
         */
        deleteOneFood: async (_, { log_id, food_id }) => {
            const updatedDailyLog = await DailyLog.findOneAndUpdate({ _id: log_id }, { $pull: { foods: { _id: food_id } } }, { new: true });
            return updatedDailyLog;
        },
    }
};
module.exports = resolvers;
