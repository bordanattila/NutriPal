const User = require('../models/User');
const path = require('path');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username: req.body.username });
        console.log('Found user')
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error logging in:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Error logging in' });
    }
};

exports.signup = async (req, res) => {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        res.status(409).send('Username already exists');
    } else {
        const newUser = new User({ username, email, password });
        await newUser.save();
        req.session.userId = newUser._id;
        res.status(201).redirect('/home');
    }
};

exports.home = (req, res) => {
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, '../public/views/home.html'));
    } else {
        res.redirect('/');
    }
};