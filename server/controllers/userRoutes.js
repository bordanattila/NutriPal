const User = require('../models/User');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const { signInToken } = require('../utils/auth');
require('dotenv').config();
const { authenticateUser } = require('../utils/helpers');
const refreshTokens = [];

// Login route
router.post('/login', async (req, res) => {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;
    try {
        const user = await authenticateUser(username, password);
        console.log('User  found:', user);
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        console.log('user=  ' + user)

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

// Signup route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        const token = signInToken({ username: newUser.username, email: newUser.email, _id: newUser._id });

        res.status(201).json({ message: 'Signup successful', token });
    } catch (error) {
        console.error('Error signing up:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Error signing up' });
    }
});

module.exports = router;
