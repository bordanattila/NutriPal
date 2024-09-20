const express = require('express');
const router = express.Router();
const foodSearch = require('./foodSearch');
const foodRoutes = require('./foodRoutes');

router.use('/foodDetails', foodRoutes);
router.use('/foodSearch', foodSearch);

// router.post('/log', foodRoutes.logFood);
// router.get('/frequent', foodRoutes.getFrequentFoods);
// router.post('/recipe', foodRoutes.saveRecipe);

module.exports = router;