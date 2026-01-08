/**
 * @file Meal.js
 * @description Mongoose model representing a saved meal composed of multiple OneFood entries.
 */
const { Schema, model } = require('mongoose');

/**
 * @constant mealSchema
 * @type {Schema}
 * @description Schema for meals created by users, including nutrition data and ingredients.
 */
const mealSchema = new Schema(
    {
        /**
         * @property {String} mealName - Name of the meal.
         */
        mealName: {
            type: String,
            required: true
        },


        /**
         * @property {ObjectId} user_id - Reference to the User who created the meal.
         */
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        /**
         * @property {ObjectId[]} ingredients - Array of references to OneFood entries.
         */
        ingredients: [{
            type: Schema.Types.ObjectId,
            ref: 'OneFood'
        }],

        /**
         * @property {String} servingSize - Description of serving size defaults to 1.
         */
        servingSize: {
            type: String,
            default: '1',
        },

        /**
         * @property {Object} nutrition - Total nutritional data for one serving of the meal.
         * @property {Number} nutrition.calories
         * @property {Number} nutrition.carbohydrate
         * @property {Number} nutrition.protein
         * @property {Number} nutrition.fat
         * @property {Number} nutrition.saturated_fat
         * @property {Number} nutrition.sodium
         * @property {Number} nutrition.fiber
         */
        nutrition: {
            caloriesPerServing: { type: Number },
            carbohydratePerServing: { type: Number },
            proteinPerServing: { type: Number },
            fatPerServing: { type: Number },
            saturatedFatPerServing: { type: Number },
            sodiumPerServing: { type: Number },
            fiberPerServing: { type: Number },
        }
    },
);

/**
 * @constant Meal
 * @type {Model}
 * @description Mongoose model for the Meal collection.
 */
const Meal = model('Meal', mealSchema);

module.exports = Meal;
