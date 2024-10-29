const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getAccessTokenValue } = require('../../../server/utils/apiAuth')

async function getFoodDetailsById(accessToken, foodId) {
  const searchUrl = 'https://platform.fatsecret.com/rest/food/v4';
  try {
    const response = await axios.get(
      searchUrl,
      {
        params: {
          method: 'food.get.v4',
          food_id: foodId,
          format: 'json',
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    res.status(500).json({ error: 'Error fetching food details' });
  }
};

router.get('/foodById/:foodId', async (req, res) => {
  const foodId = req.params.foodId;
  if (!foodId) {
    console.error('req.body.foodName is undefined');
    res.status(400).json({ error: 'Nincs foodId' });
    return;
  }
  try {
    const accessToken = await getAccessTokenValue();
    const detailsFromApi = await getFoodDetailsById(accessToken, foodId);
    console.log(detailsFromApi.food.servings)
    res.json(detailsFromApi);
  } catch (error) {
    console.error(`Error in /foodById/:foodId route: ${error}`);
    res.status(500).send('Error fetching food details');
  }
});

module.exports = router;