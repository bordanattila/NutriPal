/**
 * @file IdGenerator.js
 * @description Utility functions to generate unique food and serving IDs using nanoid.
 */

// Only digits, length 6
/**
 * @function generateFoodId
 * @async
 * @description Generates a unique 6-digit numeric food ID prefixed with 'F-' (e.g., F-123456).
 * Checks for uniqueness within the specified model.
 * @param {mongoose.Model} Model - The Mongoose model to check for existing food_id.
 * @returns {Promise<string>} A unique food ID.
 */
const generateFoodId = async (Model) => {
  const { customAlphabet } = await import('nanoid');
  const nanoDigits = customAlphabet('0123456789', 6);

  let id;
  let exists = true;
  while (exists) {
    id = `F-${nanoDigits()}`;
    exists = await Model.exists({ food_id: id });
  }
  return id;
};

/**
 * @function generateServingId
 * @async
 * @description Generates a unique 6-digit numeric serving ID prefixed with 'S-' (e.g., S-123456).
 * Checks for uniqueness within the specified model.
 * @param {mongoose.Model} Model - The Mongoose model to check for existing serving_id.
 * @returns {Promise<string>} A unique serving ID.
 */
const generateServingId = async (Model) => {
  const { customAlphabet } = await import('nanoid');
  const nanoDigits = customAlphabet('0123456789', 6);

  let id;
  let exists = true;
  while (exists) {
    id = `S-${nanoDigits()}`;
    exists = await Model.exists({ serving_id: id });
  }
  return id;
};

module.exports = { generateFoodId, generateServingId };