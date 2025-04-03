/**
 * Routes for user authentication (login & signup).
 * Uses JWT for signing tokens and interacts with the User model.
 */
const User = require('../models/User');
const express = require('express');
const router = express.Router();
const { signInToken } = require('../utils/auth');
require('dotenv').config();
const refreshTokens = [];

/**
 * @route POST /login
 * @desc Authenticate user by username and password
 * @access Public
 * @returns {Object} JWT token, refresh token, and username if successful
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Session data size:', JSON.stringify(req.session).length);
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        // Check if the password is correct
        const isValidPassword = await user.isCorrectPassword(password);
        if (!isValidPassword) {
            return res.status(401).send('Invalid password');
        }

        // Sign a token for the user
        const token = signInToken({ username: user.username, email: user.email, _id: user._id });
        const refreshToken = signInToken({ username: user.username, email: user.email, _id: user._id });
        refreshTokens.push(refreshToken)

        // Respond with the token and user information        
        res.status(200).json({ token, refreshToken, username: user.username });
    } catch (error) {
        console.error('Error logging in:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Error logging in' });
    }
});

/**
 * @route POST /signup
 * @desc Register a new user and return signed JWT token
 * @access Public
 * @returns {Object} JWT token and success message if successful
 */
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();

        const token = signInToken({ username: newUser.username, email: newUser.email, _id: newUser._id });

        res.status(201).json({ message: 'Signup successful', token });
    } catch (error) {
        console.error('Error signing up:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Error signing up' });
    }
});

/**
 * @route POST /profile
 * @desc (Commented Out) Update user's profile with calorie goal, password, and profile picture
 * @access Private
 * @remarks 
 * - Hashes password if updated
 * - Uses Mongoose's findByIdAndUpdate
 */
// router.post('/profile', async (req, res) => {
//     const { userId, user_calorieGoal, password, profilePic } = req.body;

//     try {
//         const existingUser = await User.findById(userId);

//         if (!existingUser) {
//             return res.status(404).json({ message: "User doesn't exist" });
//         }

//         // If a new password is provided, hash it
//         let updatedFields = { calorieGoal: user_calorieGoal, profilePic };
//         if (password) {
//             const saltRounds = 10;
//             updatedFields.password = await bcrypt.hash(password, saltRounds);
//         }

//         // Update the user with the new information
//         const updatedUser = await User.findByIdAndUpdate(
//             userId,
//             { $set: updatedFields },
//             { new: true }
//         );

//         res.status(200).json({ message: 'Update successful', user: updatedUser });
//     } catch (error) {
//         console.error('Error updating:', error.message);
//         res.status(500).json({ message: 'Error updating' });
//     }
// });

module.exports = router;
