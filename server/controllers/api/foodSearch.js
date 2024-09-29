const axios = require('axios');  // Using axios for the HTTP request instead of request.
const qs = require('qs');  // The qs module is used to properly format the data as application/x-www-form-urlencoded.
const { getAccessToken } = require('../../utils/apiAuth')
const express = require('express');
const router = express.Router();

// Function to make a FatSecret API call
async function searchFoodByName(accessToken, searchExpression = foodName) {
  const searchUrl = 'https://platform.fatsecret.com/rest/foods/search/v1';
  try {
    const response = await axios.post(
      searchUrl,
      null,  // No body data, as we are sending parameters in the URL
      {
        params: {
          method: 'foods.search',
          search_expression: searchExpression,
          format: 'json'
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    console.log(response.data.foods.food[0])
    return response.data;
  } catch (error) {
    console.error('Error searching for food:', error.response ? error.response.data : error.message);
  }
};

// Use the access token to call the API
router.post('/searchFoodByName', async (req, res) => {
  const foodName = req.body.foodName;
  if (!foodName) {
    console.error('req.body.foodName is undefined');
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }
  // Getting access token
  const accessToken = await getAccessToken();
  if (accessToken) {
    try {
      // Call function with access token
      const searchResults = await searchFoodByName(accessToken, foodName);
      if (searchResults) {
        const foodArray = searchResults.foods.food
        res.json(foodArray);
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } catch (error) {
      console.error('Error searching for food:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

module.exports = router;