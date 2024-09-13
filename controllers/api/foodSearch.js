const axios = require('axios');  // Using axios for the HTTP request instead of request.
const qs = require('qs');  // The qs module is used to properly format the data as application/x-www-form-urlencoded.

require('dotenv').config();
const { CLIENT_ID, CLIENT_SECRET } = process.env;

// const request = require("request");
// const Food = require('../models/Food');


// Function to get the OAuth 2.0 access token
async function getAccessToken() {
  const tokenUrl = 'https://oauth.fatsecret.com/connect/token';
  const data = qs.stringify({
    grant_type: 'client_credentials',
    scope: 'basic'
  });

  try {
    const response = await axios.post(tokenUrl, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
      }
    });

    const accessToken = response.data.access_token;
    console.log('Access Token:', accessToken);
    return accessToken;
  } catch (error) {
    console.error('Error fetching access token:', error.response ? error.response.data : error.message);
  }
}

// Function to make a FatSecret API call
async function searchFood(accessToken, searchExpression = foodName) {
  const searchUrl = 'https://platform.fatsecret.com/rest/server.api';
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

    console.log('FatSecret API response:', response.data);
    const searchData = response.data;
    return searchData;
  } catch (error) {
    console.error('Error searching for food:', error.response ? error.response.data : error.message);
  }
}

// Use the access token to call the API
async function scanBarcode(req, res) {
  const foodName = req.body.foodName
  const accessToken = await getAccessToken();
  if (accessToken) {
    const searchData = await searchFood(accessToken, foodName);
    console.log('**************************************************')
    console.log(searchData.foods.food[0])
    res.json(searchData);
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

exports.scanBarcode = scanBarcode;

//   });



// };

// exports.logFood = async (req, res) => {
//     const { userId, foodData } = req.body;
//     try {
//         const newFood = new Food({ userId, ...foodData });
//         await newFood.save();
//         res.status(201).send('Food logged successfully');
//     } catch (error) {
//         res.status(500).send('Error logging food');
//     }
// };

// exports.getFrequentFoods = async (req, res) => {
//     const { userId } = req.query;
//     try {
//         const foods = await Food.find({ userId }).limit(10);
//         res.json(foods);
//     } catch (error) {
//         res.status(500).send('Error fetching frequent foods');
//     }
// };

// exports.saveRecipe = async (req, res) => {
//     const { userId, recipeData } = req.body;
//     try {
//         const newRecipe = new Recipe({ userId, ...recipeData });
//         await newRecipe.save();
//         res.status(201).send('Recipe saved successfully');
//     } catch (error) {
//         res.status(500).send('Error saving recipe');
//     }
// };