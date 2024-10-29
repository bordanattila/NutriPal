const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const oneFoodSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
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
  calories: {
    type: Number,
    required: true,
  },
  carbohydrate: {
    type: Number,
    required: true,
  },
  protein: {
    type: Number,
    required: true,
  },
  fat: {
    type: Number,
    required: true,
  },
  saturated_fat: {
    type: Number,
    required: true,
  },
  sodium: {
    type: Number,
    required: true,
  },
  fiber: {
    type: Number,
    required: true,
  },
  meal_type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
  },
}
);

const OneFood = mongoose.model('OneFood', oneFoodSchema);

module.exports = OneFood;
