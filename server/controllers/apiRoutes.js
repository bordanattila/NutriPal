const express = require('express');
const router = express.Router();
const { getAccessTokenValue } = require('../utils/apiAuth');
const axios = require('axios');
const qs = require('qs');
const DailyLog = require('../models/DailyLog');
const OneFood = require('../models/OneFood');
const Recipe = require('../models/Recipe');
const { calculateRecipeNutrition } = require('../utils/nutritionCalculation');
const { DateTime } = require('luxon');

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

const { convertUpcEtoUpcA } = require('../utils/barcodeConverter')
// Endpoint to search foods via FatSecret API by barcode
router.get('/foodByBarcode', async (req, res) => {

    const { query } = req;
    console.log("barcode", query.barcode)
    try {
        const upcA = await convertUpcEtoUpcA(query.barcode)
        const formattedBarcode = upcA.padStart(13, '0');
        console.log("formattedBarcode", formattedBarcode)
        const token = await getAccessTokenValue();
        const tokenUrl = 'https://platform.fatsecret.com/rest/food/barcode/find-by-id/v1';
        const response = await axios.get(tokenUrl, {
            params: {
                method: 'food.find_id_for_barcode',
                barcode: formattedBarcode,
                format: 'json'
            },
            headers: {
                // 'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + token // Use the access token
            }
        });
        console.log("API Response Data:", response.data);
        res.json(response.data); // Send back the response from FatSecret API
    } catch (error) {
        console.error('Error fetching food data:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch food data' });
    }
});

// Endpoint to search food by id
router.get('/:sourcePage/foodById', async (req, res) => {
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

// Endpoint to query selected day's food logs for a user
router.get('/foodByDate/:user_id/date/:dateCreated', async (req, res) => {
    try {
        const userId = req.params.user_id;
        const selectedDate = (req.params.dateCreated);
        console.log("daily log selected date", selectedDate)
        // // Create variable for start of date
        // const startOfDay = DateTime.now()
        //     .setZone('America/New_York')
        //     .startOf('day')
        //     .toUTC()
        //     .toJSDate();

        // // Create variable for end of date
        // const endOfDay = DateTime.now()
        //     .setZone('America/New_York')
        //     .endOf('day')
        //     .toUTC()
        //     .toJSDate();

        // Parse the date using Luxon (assumes the format 'yyyy-MM-dd')
        const selected = DateTime.fromFormat(selectedDate, 'yyyy-MM-dd', { zone: 'America/New_York' });
console.log("selected", selected)
        // Compute the start and end of the selected day
        const startOfDay = selected
        .startOf('day')
        .toUTC()
        .toJSDate();
        const endOfDay = selected
        .endOf('day')
        .toUTC()
        .toJSDate();
        console.log("Computed startOfDay:", startOfDay);
console.log("Computed endOfDay:", endOfDay);


        const recentFoods = await DailyLog.findOne({
            user_id: userId,
            dateCreated: { $gte: startOfDay, $lte: endOfDay }
        }).populate('foods')
        console.log(recentFoods)
        if (!recentFoods) {
            return res.json({ message: 'No food has been logged for this day.' });
        }

        res.json(recentFoods);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


// Endpoint to query recipe logs for a user
router.get('/saved-recipes/:user_id', async (req, res) => {
    try {
        const userId = req.params.user_id;
        const recentRecipes = await OneFood.find({ user_id: userId })
        // // Sort by 'created' field in descending order
        // .sort({ created: -1 })
        // // Limit to 5 items
        // .limit(5);
        res.json(recentRecipes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint for logging one food item
router.post('/one-food', async (req, res) => {
    try {
        // Destructure the required fields from the request body
        const { user_id, food_id, food_name, serving_id, serving_size, number_of_servings, calories, carbohydrate, protein, fat, saturated_fat, sodium, fiber, meal_type, brand } = req.body;

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
            meal_type: meal_type.toLowerCase(),
            brand
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
        console.log("dashboard params", req.body.foods)

        // Get current date and compute start and end of day.
        const startOfDay = DateTime.now()
            .setZone('America/New_York')
            .startOf('day')
            .toUTC()
            .toJSDate();
        const endOfDay = DateTime.now()
            .setZone('America/New_York')
            .endOf('day')
            .toUTC()
            .toJSDate();
        // Check if a DailyLog exists for this user for today.
        let dailyLog = await DailyLog.findOne({
            user_id,
            dateCreated: { $gte: startOfDay, $lte: endOfDay }
        });
        if (dailyLog) {
            // Update the existing DailyLog by appending new foods.
            dailyLog.foods = dailyLog.foods.concat(foods);
            await dailyLog.save();
            res.status(200).json(dailyLog);
        } else {
            // Create a new DailyLog if none exists for today.
            dailyLog = new DailyLog({
                user_id,
                dateCreated: startOfDay,
                foods
            });
            await dailyLog.save();
            res.status(201).json(dailyLog);
        }
    } catch (error) {
        console.error('Error creating daily log:', error);
        res.status(500).json({ message: 'Error creating daily log', error: error.message });
    }
});

// Endpoint to add a recipe
router.post('/recipe', async (req, res) => {

    try {
        const { user_id, recipeName, servings, ingredients } = req.body;
        // Retrieve OneFood entry by its _id
        const ingredient = await OneFood.find({ _id: { $in: ingredients } });

        // Calculate the nutrition per serving
        const nutrition = calculateRecipeNutrition(ingredient, servings);
        console.log("user_id", user_id)
        console.log("recipeName", recipeName)
        console.log("servings", servings)
        console.log("ingredients", ingredients)
        console.log("nutrition", nutrition)

        // Create a new Recipe entry
        const newRecipe = new Recipe({
            user_id,
            recipeName,
            servings,
            // Directly use the ingredients from the request body
            ingredients,
            nutrition,
        });

        await newRecipe.save();
        res.status(201).json(newRecipe);
    } catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ message: 'Error creating recipe', error: error.message });
    }
});

// Endpoint to handle token refreshing
router.post('/refresh', async (req, res) => {
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
