const express = require('express');
const router = express.Router();
const path = require('path');
const userRoutes = require('./userRoutes');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/index.html'));
});

router.get('/home', userRoutes.home);
router.post('/login', userRoutes.login);
router.post('/signup', userRoutes.signup);

module.exports = router;