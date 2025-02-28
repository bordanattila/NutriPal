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
        nutrition: {
            caloriesPerServing: { type: Number },
            carbohydratePerServing: { type: Number },
            proteinPerServing: { type: Number },
            fatPerServing: { type: Number },
        }
    },
);

const Recipe = model('Recipe', recipeSchema);

module.exports = Recipe;
