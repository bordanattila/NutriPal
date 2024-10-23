const express = require('express');
const router = express.Router();
const { getAccessTokenValue } = require('../utils/apiAuth');
const axios = require('axios');
const qs = require('qs');

// Endpoint to get the access token
router.get('/token', async (req, res) => {
    try {
      const token = await getAccessTokenValue();
      res.json({ accessToken: token });
    } catch (error) {
      console.error('Error retrieving access token:', error);
      res.status(500).json({ error: 'Failed to retrieve access token' });
    }
  });

// Endpoint to search foods via FatSecret API
router.get('/search', async (req, res) => {
    
    const { query } = req; 
    console.log(query)
    const token = await getAccessTokenValue(); 

    const tokenUrl = 'https://platform.fatsecret.com/rest/foods/search/v1';
    const data = qs.stringify({
        method: 'foods.search',
        search_expression: query.searchExpression,
        format: 'json' ,
    });

    try {
        const response = await axios.post(tokenUrl, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + token // Use the access token
            }
        });
        res.json(response.data); // Send back the response from FatSecret API
        // const foodArray = response.foods.food
        // console.log('FatSecret API'+foodArray)
    } catch (error) {
        console.error('Error fetching food data:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch food data' });
    }
});

module.exports = router;
