const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getAccessTokenValue } = require('../../utils/apiAuth')
const fs = require('fs').promises;

async function getFoodDetailsById(accessToken, foodId) {
  console.log('FoodID = ' + foodId)
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
    ).json()
    console.log('Food Detail API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching food details:', error.response ? error.response.data : error.message);
    throw error;
  }
};

router.get('/foodDetails/:foodId', async (req, res) => {
  const foodId = req.params.foodId;
  console.log(`Received request for food ID: ${foodId}`);
  try {
    const accessToken = await getAccessTokenValue();
    console.log(`Got access token`);
    const detailsFromApi = await getFoodDetailsById(accessToken, foodId);
    console.log(detailsFromApi)
    console.log('Servings')
    console.log(detailsFromApi.food.servings)
    res.render('foodDetails', { detailsFromApi })
  } catch (error) {
    console.error(`Error in /foodDetails/:foodId route: ${error}`);
    res.status(500).send('Error fetching food details');
  }
});

module.exports = router;