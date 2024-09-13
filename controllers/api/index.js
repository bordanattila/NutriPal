const express = require('express');
const router = express.Router();
const foodSearch = require('./foodSearch');
const foodRoutes = require('./foodRoutes');

// router.get('/api/scanBarcode', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/views/foodDetails.html'));
// });

router.get('/foodDetails', foodRoutes.foodDetails);

router.post('/scanBarcode', foodSearch.scanBarcode);
// router.post('/log', foodRoutes.logFood);
// router.get('/frequent', foodRoutes.getFrequentFoods);
// router.post('/recipe', foodRoutes.saveRecipe);

module.exports = router;