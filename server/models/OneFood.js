const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const oneFoodSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
    required: true,
  },
  food_id: {
    type: String,
    required: true,
  },
  food_name: {
    type: String,
    required: true,
  },
  serving_id: {
    type: String,
    required: true,
  },
  serving_size: {
    type: String,
    required: true,
  },
  number_of_servings: {
    type: Number,
    required: true,
  },
  fraction_of_serving: {
    type: String,
    required: false,
  },
  calories: {
    type: Number,
    required: false,
  },
  carbohydrate: {
    type: Number,
    required: false,
  },
  protein: {
    type: Number,
    required: false,
  },
  fat: {
    type: Number,
    required: false,
  },
  saturated_fat: {
    type: Number,
    required: false,
  },
  sodium: {
    type: Number,
    required: false,
  },
  fiber: {
    type: Number,
    required: false,
  },
  meal_type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
  },
  brand: {
    type: String,
    required: false,
  },
  food_type: {
    type: String,
    enum: ['api', 'recipe', 'homemade'],
    required: true,
    default: 'api'
  }
}
);

const OneFood = mongoose.model('OneFood', oneFoodSchema);

module.exports = OneFood;
