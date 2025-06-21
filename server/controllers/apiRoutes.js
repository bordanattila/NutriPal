/**
 * @file apiRoutes.js
 * @description Contains routes for fetching, logging, and managing food and recipe data.
 */
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
const { generateFoodId, generateServingId } = require('../utils/idGenerator');
const { convertUpcEtoUpcA } = require('../utils/barcodeConverter');
const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
require('dotenv').config();

/**
 * @route GET /api/token
 * @desc Get FatSecret access token
 * @access Public
 */
router.get('/token', async (req, res) => {
    try {
        const token = await getAccessTokenValue();
        res.json({ accessToken: token });
    } catch (error) {
        console.error('Error retrieving access token:', error);
        res.status(500).json({ error: 'Failed to retrieve access token' });
    }
});

/**
 * @route GET /api/foodByName
 * @desc Search for food by name using FatSecret API
 * @access Public
 */
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

/**
 * @route GET /api/foodByBarcode
 * @desc Search for food by barcode using FatSecret API
 * @access Public
 */
router.get('/foodByBarcode', async (req, res) => {

    const { query } = req;
    try {
        const upcA = await convertUpcEtoUpcA(query.barcode)
        const formattedBarcode = upcA.padStart(13, '0');
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
        res.json(response.data); // Send back the response from FatSecret API
    } catch (error) {
        console.error('Error fetching food data:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch food data' });
    }
});

/**
 * @route GET /api/:sourcePage/foodById
 * @desc Fetch food details by FatSecret food_id
 * @access Public
 */
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


/**
 * @route GET /api/recent-foods/:user_id
 * @desc Get 5 most recent food logs for a user
 * @access Private
 */
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

/**
 * @route GET /api/foodByDate/:user_id/date/:dateCreated
 * @desc Get food logs for a specific date
 * @access Private
 */
router.get('/foodByDate/:user_id/date/:dateCreated', async (req, res) => {
    try {
        const userId = req.params.user_id;
        const selectedDate = (req.params.dateCreated);

        // Parse the date using Luxon (assumes the format 'yyyy-MM-dd')
        const selected = DateTime.fromFormat(selectedDate, 'yyyy-MM-dd', { zone: 'America/New_York' });

        // Compute the start and end of the selected day
        const startOfDay = selected
            .startOf('day')
            .toUTC()
            .toJSDate();
        const endOfDay = selected
            .endOf('day')
            .toUTC()
            .toJSDate();

        const adjustedStartOfDay = new Date(startOfDay.getTime() - 4 * 60 * 60 * 1000);

        const recentFoods = await DailyLog.findOne({
            user_id: userId,
            dateCreated: { $gte: adjustedStartOfDay, $lte: endOfDay }
        }).populate('foods')
        if (!recentFoods) {
            return res.json({ message: 'No food has been logged for this day.' });
        }

        res.json(recentFoods);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


/**
 * @route GET /api/saved-recipes/:user_id
 * @desc Get saved recipes for a user
 * @access Private
 */
router.get('/saved-recipes/:user_id', async (req, res) => {
    try {
        const userId = req.params.user_id;
        const recentRecipes = await Recipe.find({ user_id: userId })
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

/**
 * @route POST /api/log-recipe/:recipeID
 * @desc Log a single recipe to the database
 * @access Private
 */
router.get('/log-recipe/:recipeID', async (req, res) => {
    try {
        const { recipeID } = req.params;
        const servings = parseFloat(req.query.servings);

        const selectedRecipe = await Recipe.findById(recipeID).populate('ingredients');
        if (!selectedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Use your nutrition calculator
        const nutrition = calculateRecipeNutrition(selectedRecipe.ingredients, servings);
        res.json({
            recipeName: selectedRecipe.recipeName,
            nutrition,
            selectedServing: {
                calories: nutrition.calories,
                carbohydrate: nutrition.carbohydrate,
                protein: nutrition.protein,
                fat: nutrition.fat,
                saturated_fat: nutrition.saturated_fat,
                sodium: nutrition.sodium,
                fiber: nutrition.fiber,
                serving_description: selectedRecipe.servingSize
            }
        });
    } catch (err) {
        console.error('Error fetching recipe details:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route POST /api/one-food
 * @desc Log a single food item to the database
 * @access Private
 */
router.post('/one-food', async (req, res) => {
    try {
        const {
            user_id,
            food_name,
            food_id: incomingFoodId,
            serving_id: incomingServingId,
            serving_size,
            number_of_servings,
            fraction_of_serving,
            calories,
            carbohydrate,
            protein,
            fat,
            saturated_fat,
            sodium,
            fiber,
            meal_type,
            brand,
            food_type = 'api', // default to 'api' for backwards compatibility
        } = req.body;

        const food_id = incomingFoodId || await generateFoodId(OneFood);
        const serving_id = incomingServingId || await generateServingId(OneFood);

        const newFood = new OneFood({
            user_id,
            created: new Date(),
            food_id,
            serving_id,
            food_name,
            serving_size,
            number_of_servings,
            fraction_of_serving,
            calories,
            carbohydrate,
            protein,
            fat,
            saturated_fat,
            sodium,
            fiber,
            meal_type: meal_type.toLowerCase(),
            brand,
            food_type
        });

        await newFood.save();
        res.status(201).json(newFood);
    } catch (error) {
        console.error('Error creating food entry:', error);
        res.status(400).json({ message: 'Failed to create food entry', error: error.message });
    }
});


/**
 * @route POST /api/daily-log
 * @desc Add or update a user's daily log
 * @access Private
 */
router.post('/daily-log', async (req, res) => {
    try {
        const { user_id, foods } = req.body;

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

        const adjustedStartOfDay = new Date(startOfDay.getTime() - 4 * 60 * 60 * 1000);
        // Check if a DailyLog exists for this user for today.
        let dailyLog = await DailyLog.findOne({
            user_id,
            dateCreated: { $gte: adjustedStartOfDay, $lte: endOfDay }
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
                dateCreated: adjustedStartOfDay,
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

/**
 * @route POST /api/recipe
 * @desc Create a new recipe
 * @access Private
 */
router.post('/recipe', async (req, res) => {

    try {
        const { user_id, recipeName, servings, servingSize, ingredients } = req.body;
        // Retrieve OneFood entry by its _id
        const ingredient = await OneFood.find({ _id: { $in: ingredients } });
        // Calculate the nutrition per serving
        const nutrition = calculateRecipeNutrition(ingredient, servings);
        // Create a new Recipe entry
        const newRecipe = new Recipe({
            user_id,
            recipeName,
            servings,
            servingSize,
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


/**
 * @route DELETE /api/deleteFood/:user_id/:food_id/:date
 * @desc Remove a food item from a user's daily log by date
 * @access Private
 */
router.delete('/deleteFood/:user_id/:food_id/:date', async (req, res) => {
    try {
        const { user_id, date, food_id } = req.params;

        const selectedDate = DateTime.fromFormat(req.params.date, 'yyyy-MM-dd', { zone: 'America/New_York' });
        // Compute the start and end of the selected day
        const startOfDay = selectedDate
            .startOf('day')
            .toUTC()
            .toJSDate();
        const endOfDay = selectedDate
            .endOf('day')
            .toUTC()
            .toJSDate();

        const adjustedStartOfDay = new Date(startOfDay.getTime() - 4 * 60 * 60 * 1000);

        const food = await OneFood.findById(food_id);
        if (!food) {
            return res.status(404).json({ message: 'Food item not found' });
        }
        await DailyLog.findOneAndUpdate({

            user_id: user_id,
            dateCreated: { $gte: adjustedStartOfDay, $lte: endOfDay }
        },
            { $pull: { foods: food_id } }
        );
        res.status(200).json({ message: 'Food item removed successfully' });
    } catch (error) {
        console.error('Error removing food item:', error);
    }
})

/**
 * @route POST /api/ai-assist
 * @desc Sends a prompt to the AI assistant (LangChain + OpenAI)
 * @access Private
 */
router.post('/ai-assist', async (req, res) => {
    try {
        const { message, macros } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }

        const model = new ChatOpenAI({
            //   modelName: 'gpt-3.5-turbo',git 
            modelName: 'gpt-4.1-nano',
            temperature: 0.7,
            openAIApiKey: process.env.OPENAI_API_KEY_NP,
        });

        let userPrompt = message;

        // If macros are included, build a dynamic AI prompt
        if (macros && typeof macros === 'object') {
            const protein = macros.protein ?? 0;
            const carbs = macros.carbs ?? 0;
            const fat = macros.fat ?? 0;

            userPrompt = `
            You are a nutrition assistant. The user has already logged food today and has the following **remaining macros**:
            - Protein: ${protein}g
            - Carbs: ${carbs}g
            - Fat: ${fat}g

            Suggest a meal or food combination that helps balance these macros. Be specific and realistic:
            - Max 5 ingredients
            - List food name + quantity (e.g. "100g chicken breast")
            - Avoid generalities
            - Explain briefly why it fits the macros

            Respond only with a suggestion — assume macros are accurate and no dietary restrictions apply.
            `;
        }

        const response = await model.invoke([
            new SystemMessage('You are a helpful nutrition assistant.'),
            new HumanMessage(message),
        ]);

        res.status(200).json({ reply: response.content });
    } catch (err) {
        console.error('Error in AI assist:', err);
        res.status(500).json({ error: 'AI assistant failed to respond' });
    }
});

/**
 * @route DELETE /api/refresh
 * @desc Handles access token refreshing. (WIP – check refreshToken reference).
 * @access Private
 */
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
