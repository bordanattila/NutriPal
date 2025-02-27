/**
 * Calculates total nutritional values per serving for a recipe.
 * @param {Array} ingredients - Array of OneFood documents with nutritional data.
 * @param {Number} servings - Number of servings for the recipe.
 * @returns {Object} Nutritional info per serving.
 */
function calculateRecipeNutrition(ingredients, servings) {
    // Initialize totals for each nutritional field.
    const totals = ingredients.reduce((total, ingredient) => {
      total.calories += ingredient.calories;
      total.carbohydrate += ingredient.carbohydrate;
      total.protein += ingredient.protein;
      total.fat += ingredient.fat;
      return total;
    }, { calories: 0, carbohydrate: 0, protein: 0, fat: 0 });
  
    // Calculate per serving values.
    return {
      caloriesPerServing: totals.calories / servings,
      carbohydratePerServing: totals.carbohydrate / servings,
      proteinPerServing: totals.protein / servings,
      fatPerServing: totals.fat / servings,
    };
  }
  
  module.exports = { calculateRecipeNutrition };