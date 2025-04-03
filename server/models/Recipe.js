/**
 * @file Recipe.js
 * @description Mongoose model representing a saved recipe composed of multiple OneFood entries.
 */
const { Schema, model } = require('mongoose');

/**
 * @constant recipeSchema
 * @type {Schema}
 * @description Schema for recipes created by users, including nutrition data and ingredients.
 */
const recipeSchema = new Schema(
    {
        /**
         * @property {String} recipeName - Name of the recipe.
         */
        recipeName: {
            type: String,
            required: true
        },


        /**
         * @property {ObjectId} user_id - Reference to the User who created the recipe.
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
         * @property {String} servingSize - Description of serving size (e.g., "1 slice").
         */
        servingSize: {
            type: String,
        },

        /**
         * @property {Object} nutrition - Total nutritional data for one serving of the recipe.
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
 * @constant Recipe
 * @type {Model}
 * @description Mongoose model for the Recipe collection.
 */
const Recipe = model('Recipe', recipeSchema);

module.exports = Recipe;
