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
    try {
        // Destructure the required fields from the request body
        const { user_id, food_id, food_name, serving_id, serving_size, number_of_servings, calories, carbohydrate, protein, fat, saturated_fat, sodium, fiber, meal_type } = req.body;

        // Create a new OneFood entry
        const newFood = new OneFood({
            user_id,
            created: new Date(),
            food_id,
            food_name,
            serving_id,
            serving_size,
            number_of_servings,
            calories,
            carbohydrate,
            protein,
            fat,
            saturated_fat,
            sodium,
            fiber,
            // Convert to lowercase
            meal_type: meal_type.toLowerCase()
        });
        await newFood.save();
        res.status(201).json(newFood);
    } catch (error) {
        console.error('Error creating food entry:', error);
        res.status(400).json({ message: 'Error message for creating food entry', error: error.message });
    }
});

// Endpoint to add food to Daily Log
router.post('/daily-log', async (req, res) => {
    try {
        const { user_id, foods } = req.body;

        // Create a new Daily Log entry
        const newLog = new DailyLog({
            user_id,
            dateCreated: new Date(),
            // Directly use the foods array from the request body
            foods
        });

        await newLog.save();
        res.status(201).json(newLog);
    } catch (error) {
        console.error('Error creating daily log:', error);
        res.status(500).json({ message: 'Error creating daily log', error: error.message });
    }
});

// Endpoint to query the last 5 food logs for a user
router.get('/recent-foods/:user_id', async (req, res) => {
    try {
        const userId = req.params.user_id;
        const recentFoods = await OneFood.find({ user_id: userId })
            // Sort by 'created' field in descending order
            .sort({ created: -1 })
            // Limit to 5 items
            .limit(5);
        res.json(recentFoods);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to query today's food logs for a user
router.get('/todays-foods/:user_id', async (req, res) => {
    console.log('todays req.param' + req.params.user_id)
    try {
        const userId = req.params.user_id;
        // Create variable for start of date
        const startOfDay = new Date();
        startOfDay.setUTCDate(0, 0, 0, 0);

        // Create variable for end of date
        const endOfDay = new Date();
        endOfDay.setUTCDate(23, 59, 59, 999);
        
        const recentFoods = await OneFood.find({
            user_id: userId,
            created: { $gte: startOfDay, $lte: endOfDay }
        })
            // Sort by 'created' field in descending order
            .sort({ created: -1 })
        // console.log(recentFoods)
        res.json(recentFoods);
        console.log('res sent')
        console.log(recentFoods)
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to handle token refreshing
router.post('/refresh', async (req, res) => {
    console.log('reftesh token' + req.body)
    const { token } = req.body;

    if (!token)
        return res.status(401).json({ message: 'No token provided' });

    if (!refreshToken.include(token)) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    jwt.verify(token, refreshTokenSecret, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = jwt.sign({ username: user.username }, accessTokenSecret, { expiresIn: '15m' });
        res.json({ accessToken });
    });
});

module.exports = router;
