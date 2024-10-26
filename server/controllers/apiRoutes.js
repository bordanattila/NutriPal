const express = require('express');
const router = express.Router();
const { getAccessTokenValue } = require('../utils/apiAuth');
const axios = require('axios');
const qs = require('qs');
const DailyLog = require('../models/DailyLog');
const OneFood = require('../models/OneFood');

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

// Endpoint to search foods via FatSecret API by name
router.get('/foodByName', async (req, res) => {

    const { query } = req;
    const token = await getAccessTokenValue();
    const tokenUrl = 'https://platform.fatsecret.com/rest/foods/search/v1';
    const data = qs.stringify({
        method: 'foods.search',
        search_expression: query.searchExpression,
        format: 'json',
    });

    try {
        const response = await axios.post(tokenUrl, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + token // Use the access token
            }
        });
        res.json(response.data); // Send back the response from FatSecret API
    } catch (error) {
        console.error('Error fetching food data:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch food data' });
    }
});

// Endpoint to search food by id
router.get('/foodById', async (req, res) => {
    const food_Id = req.query.food_id;

    // Validate food_Id
    if (!food_Id) {
        console.error('Food ID is required.');
        return res.status(400).json({ error: 'Food ID is required.' });
    }

    try {
        const token = await getAccessTokenValue();
        const tokenUrl = `https://platform.fatsecret.com/rest/food/v4?method=food.get.v4&food_id=${food_Id}&format=json`;

        const response = await axios.get(tokenUrl, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + token // Use the access token
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching food data:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch food data' });
    }
});

// Endpoint for logging one food item
router.post('/one-food', async (req, res) => {
    console.log(req.body);
    try {
        // Destructure the required fields from the request body
        const { user_id, serving_size, number_of_servings, calories, carbohydrate, protein, fat, saturated_fat, sodium, fiber, meal_type } = req.body;

        // Create a new OneFood entry
        const newFood = new OneFood({
            user_id, // Assuming you want to associate the food with a user
            serving_size,
            number_of_servings,
            calories,
            carbohydrate,
            protein,
            fat,
            saturated_fat,
            sodium,
            fiber,
            meal_type: meal_type.toLowerCase() // Normalize to lowercase
        });

        console.log('one-food success');
        await newFood.save();
        res.status(201).json(newFood);
    } catch (error) {
        console.error('Error creating food entry:', error);
        res.status(400).json({ message: 'Error creating food entry', error: error.message });
    }
});

// Endpoint to add food to Daily Log
router.post('/daily-log', async (req, res) => {
    console.log('request')
    console.log('Request Body:', req.body);
    try {
        const { user_id, foods } = req.body; // Expecting foods to be an array of OneFood ObjectIds

        // Create a new Daily Log entry
        const newLog = new DailyLog({
            user_id,
            dateCreated: new Date(),
            foods // Directly use the foods array from the request body
        });

        await newLog.save();
        console.log('Daily log success');
        res.status(201).json(newLog);
    } catch (error) {
        console.error('Error creating daily log:', error);
        res.status(500).json({ message: 'Error creating daily log', error: error.message });
    }
});

module.exports = router;
