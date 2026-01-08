/**
 * Simple in-memory cache for recently added foods
 * This works around the server issue where .findOne() only returns the oldest daily log
 * for a date, missing newly added foods in newer daily log entries
 */

interface CachedFood {
  _id: string;
  food_name: string;
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  saturated_fat?: number;
  meal_type: string;
  serving_size: string;
  number_of_servings: number;
  dateStored: string; // Date the food was stored under (YYYY-MM-DD)
  timestamp: number; // When it was cached
  created?: string; // ISO timestamp when the food was actually created
}

const cache: Map<string, CachedFood[]> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Add a food to the cache for a specific date
 */
export function cacheFood(food: any, dateStored: string): void {
  const cachedFood: CachedFood = {
    _id: food._id,
    food_name: food.food_name,
    calories: food.calories || 0,
    carbohydrate: food.carbohydrate || 0,
    protein: food.protein || 0,
    fat: food.fat || 0,
    fiber: food.fiber,
    sodium: food.sodium,
    saturated_fat: food.saturated_fat,
    meal_type: food.meal_type,
    serving_size: food.serving_size,
    number_of_servings: food.number_of_servings,
    dateStored,
    timestamp: Date.now(),
    created: food.created, // Store the actual creation timestamp
  };

  if (!cache.has(dateStored)) {
    cache.set(dateStored, []);
  }
  
  const foodsForDate = cache.get(dateStored)!;
  // Remove if already exists (update)
  const existingIndex = foodsForDate.findIndex(f => f._id === cachedFood._id);
  if (existingIndex >= 0) {
    foodsForDate[existingIndex] = cachedFood;
  } else {
    foodsForDate.push(cachedFood);
  }
}

/**
 * Get cached foods for a specific date
 */
export function getCachedFoods(date: string): CachedFood[] {
  const foods = cache.get(date) || [];
  const now = Date.now();
  
  // Filter out expired entries
  const validFoods = foods.filter(f => (now - f.timestamp) < CACHE_DURATION);
  
  // Update cache with only valid foods
  if (validFoods.length !== foods.length) {
    cache.set(date, validFoods);
  }
  
  return validFoods;
}

/**
 * Clear cache for a specific date
 */
export function clearCache(date?: string): void {
  if (date) {
    cache.delete(date);
  } else {
    cache.clear();
  }
}

