const express = require('express');
const router = express.Router();
const foodSearch = require('./foodSearch');
const foodRoutes = require('./foodRoutes');

router.use('/foodDetails', foodRoutes);
router.use('/foodSearch', foodSearch);

module.exports = router;