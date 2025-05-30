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
export function calculateRecipeNutrition(ingredients: Array<Object>, servings: number): Object;
