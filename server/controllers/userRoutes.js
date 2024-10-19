const User = require('../models/User');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const { signToken } = require('../utils/auth');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    // Sign a token for the user
    const token = signToken({ username: user.username, email: user.email, _id: user._id });

    // Respond with the token and user information
    res.status(200).json({ login: { token, user: { _id: user._id, username: user.username } } });
    

  } catch (error) {
    console.error('Error logging in:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    req.session.userId = newUser._id;
    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    console.error('Error signing up:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error signing up' });
  }
});

// Dashboard route
router.get('/dashboard', (req, res) => {
  if (req.session.userId) {
    res.render('index', { route: '/dashboard' });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

module.exports = router;