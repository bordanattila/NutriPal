const User = require('../models/User');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

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
    req.session.userId = user._id;
    res.status(201).json({ message: 'Login successful' });
    // req.session.save(() => {
    //   req.session.loggedIn = true;
    //   req.session.userId = user._id;
    //   res.json({ user: user, message: 'Login successful' });
    // });

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