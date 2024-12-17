const { Schema, model } = require('mongoose');

const recipeSchema = new Recipe(
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

    },
);

const Recipe = model('Recipe', recipeSchema);

module.exports = Recipe;
