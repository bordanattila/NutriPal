/**
 * @file nutritionCalculation.js
 * @description Contains helper logic for calculating nutritional values per serving in a recipe.
 */

/**
 * @function calculateRecipeNutrition
 * @description Calculates total and per-serving nutritional data based on provided food ingredients.
 * @param {Array<Object>} ingredients - Array of OneFood documents containing nutrition values.
 * @param {Number} servings - Number of servings the full recipe makes.
 * @returns {Object} Nutritional values per serving (calories, macros, sodium, fiber).
 * 
 * @example
 * const nutrition = calculateRecipeNutrition([food1, food2], 4);
 * console.log(nutrition.caloriesPerServing); // 120
 */
function calculateRecipeNutrition(ingredients, servings) {
    // Initialize totals for each nutritional field.
    const totals = ingredients.reduce((total, ingredient) => {
      total.calories += ingredient.calories;
      total.carbohydrate += ingredient.carbohydrate;
      total.protein += ingredient.protein;
      total.fat += ingredient.fat;
      total.saturated_fat += ingredient.saturated_fat;
      total.sodium += ingredient.sodium;
      total.fiber += ingredient.fiber;
      return total;
    }, { calories: 0, carbohydrate: 0, protein: 0, fat: 0, saturated_fat: 0, sodium: 0, fiber: 0});
  
    // Calculate per serving values.
    return {
      caloriesPerServing: totals.calories / servings,
      carbohydratePerServing: totals.carbohydrate / servings,
      proteinPerServing: totals.protein / servings,
      fatPerServing: totals.fat / servings,
      saturatedFatPerServing: totals.saturated_fat / servings,
      sodiumPerServing: totals.sodium / servings,
      fiberPerServing: totals.fiber / servings,
    };
  }
  
  module.exports = { calculateRecipeNutrition };