/**
 * @file OneFood.js
 * @description Mongoose model representing a single food entry consumed by a user.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @constant oneFoodSchema
 * @type {Schema}
 * @description Schema representing a single food item consumed by a user.
 */
const oneFoodSchema = new Schema({

  /**
 * @property {ObjectId} user_id - Reference to the User who logged the food.
 */
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  /**
 * @property {Date} created - Timestamp when the food was logged.
 */
  created: {
    type: Date,
    default: Date.now,
    required: true,
  },

    /**
   * @property {String} food_id - ID of the food item (from FatSecret API or internal).
   */
  food_id: {
    type: String,
    required: true,
  },

    /**
   * @property {String} food_name - Name/description of the food.
   */
  food_name: {
    type: String,
    required: true,
  },

    /**
   * @property {String} serving_id - ID of the serving size.
   */
  serving_id: {
    type: String,
    required: true,
  },

    /**
   * @property {String} serving_size - Text description of serving size (e.g. "1 cup").
   */
  serving_size: {
    type: String,
    required: true,
  },

    /**
   * @property {Number} number_of_servings - Number of servings consumed.
   */
  number_of_servings: {
    type: Number,
    required: true,
  },

    /**
   * @property {String} fraction_of_serving - Optional fraction (e.g., "1/2") for more precision.
   */
  fraction_of_serving: {
    type: String,
    required: false,
  },

    /**
   * @property {Number} calories - Total calories in the food item.
   */
  calories: {
    type: Number,
    required: false,
  },

    /**
   * @property {Number} carbohydrate - Total carbohydrates (in grams).
   */
  carbohydrate: {
    type: Number,
    required: false,
  },

    /**
   * @property {Number} protein - Total protein (in grams).
   */
  protein: {
    type: Number,
    required: false,
  },

    /**
   * @property {Number} fat - Total fat (in grams).
   */
  fat: {
    type: Number,
    required: false,
  },

    /**
   * @property {Number} saturated_fat - Saturated fat (in grams).
   */
  saturated_fat: {
    type: Number,
    required: false,
  },

    /**
   * @property {Number} sodium - Sodium content (in mg).
   */

  sodium: {
    type: Number,
    required: false,
  },

    /**
   * @property {Number} fiber - Fiber content (in grams).
   */
  fiber: {
    type: Number,
    required: false,
  },

    /**
   * @property {String} meal_type - Type of meal (breakfast, lunch, dinner, or snack).
   */
  meal_type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
  },

    /**
   * @property {String} brand - Brand name (if available).
   */
  brand: {
    type: String,
    required: false,
  },

    /**
   * @property {String} food_type - Source of the food ('api', 'recipe', or 'homemade').
   */
  food_type: {
    type: String,
    enum: ['api', 'recipe', 'homemade'],
    required: true,
    default: 'api'
  }
}
);

/**
 * @constant OneFood
 * @type {Model}
 * @description Mongoose model for the OneFood collection.
 */
const OneFood = mongoose.model('OneFood', oneFoodSchema);

module.exports = OneFood;
