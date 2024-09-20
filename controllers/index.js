const express = require('express');
const router = express.Router();
const path = require('path');
const userRoutes = require('./userRoutes');
const apiRoutes = require("./api");

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/index.html'));
});

router.use('/', userRoutes);
router.use("/api", apiRoutes);

module.exports = router;