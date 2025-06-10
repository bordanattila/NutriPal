export interface Food {
  food_id: string;
  food_name: string;
  brand_name?: string;
  food_description?: string;
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  number_of_servings: number;
  serving_size: string;
} 