const { Schema, model } = require('mongoose');

const recipeSchema = new Schema(
    {
        recipeName: {
            type: String,
            required: true
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        ingredients: [{
            type: Schema.Types.ObjectId,
            ref: 'OneFood'
        }],
        servingSize: {
            type: String,
        },
        nutrition: {
            caloriesPerServing: { type: Number },
            carbohydratePerServing: { type: Number },
            proteinPerServing: { type: Number },
            fatPerServing: { type: Number },
            saturatedFatPerServing: { type: Number},
            sodiumPerServing: { type: Number},
            fiberPerServing: { type: Number},
        }
    },
);

const Recipe = model('Recipe', recipeSchema);

module.exports = Recipe;
