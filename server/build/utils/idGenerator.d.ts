/**
 * @file IdGenerator.js
 * @description Utility functions to generate unique food and serving IDs using nanoid.
 */
/**
 * @function generateFoodId
 * @async
 * @description Generates a unique 6-digit numeric food ID prefixed with 'F-' (e.g., F-123456).
 * Checks for uniqueness within the specified model.
 * @param {mongoose.Model} Model - The Mongoose model to check for existing food_id.
 * @returns {Promise<string>} A unique food ID.
 */
export function generateFoodId(Model: mongoose.Model): Promise<string>;
/**
 * @function generateServingId
 * @async
 * @description Generates a unique 6-digit numeric serving ID prefixed with 'S-' (e.g., S-123456).
 * Checks for uniqueness within the specified model.
 * @param {mongoose.Model} Model - The Mongoose model to check for existing serving_id.
 * @returns {Promise<string>} A unique serving ID.
 */
export function generateServingId(Model: mongoose.Model): Promise<string>;
