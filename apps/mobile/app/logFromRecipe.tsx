import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ky from 'ky';
import { mobileAuthService as Auth } from '@/utils/authServiceMobile';
import DonutChart from '@/components/DonutChart';
import DropdownSelect from '@/components/DropdownSelect';
import { DateTime } from 'luxon';
import { JwtPayload } from 'jwt-decode';

interface CustomJwtPayload extends JwtPayload {
  data?: {
    _id?: string;
    id?: string;
  };
  _id?: string;
  id?: string;
}

interface Serving {
  serving_description: string;
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  saturated_fat: number;
  sodium: number;
  fiber: number;
  serving_id: string;
}

interface RecipeDetails {
  recipeName: string;
  selectedServing: {
    serving_description: string;
  };
  nutrition: {
    caloriesPerServing: number;
    carbohydratePerServing: number;
    proteinPerServing: number;
    fatPerServing: number;
    saturatedFatPerServing: number;
    sodiumPerServing: number;
    fiberPerServing: number;
  };
}

interface SavedRecipe {
  _id: string;
  recipeName: string;
  user_id: string;
  servings: number;
  servingSize: string;
}

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const fractions = ['0', '1/8', '1/4', '1/3', '3/8', '1/2', '5/8', '2/3', '3/4', '7/8'];

const api = ky.create({
  prefixUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.14:4000',
});

export default function LogFromRecipe() {
  const router = useRouter();
  const { recipeName, recipeID } = useLocalSearchParams();
  
  console.log('LogFromRecipe component params:', { recipeName, recipeID });
  
  const [foodDetails, setFoodDetails] = useState<RecipeDetails | null>(null);
  const [selectedServing, setSelectedServing] = useState<Serving | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servingCount, setServingCount] = useState(1);
  const [fractionCount, setFractionCount] = useState('0');
  const [fractionValue, setFractionValue] = useState(0);
  const [meal, setMeal] = useState(mealTypes[0]);
  const [userId, setUserId] = useState<string | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = await Auth.getToken();
        if (!token) {
          router.replace('/login');
          return;
        }

        const profile = await Auth.getProfile() as CustomJwtPayload;
        if (!profile) {
          router.replace('/login');
          return;
        }

        const user = profile.data?._id || profile.data?.id || profile._id || profile.id;
        if (!user) {
          router.replace('/login');
          return;
        }

        setUserId(user);
      } catch (error) {
        console.error('Error loading user data:', error);
        router.replace('/login');
      }
    };

    loadUserData();
  }, [router]);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      if (!userId) return;

      setLoadingRecipes(true);
      try {
        const response = await api.get(`api/saved-recipes/${userId}`);
        const recipes: SavedRecipe[] = await response.json();
        setSavedRecipes(recipes);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching saved recipes:', err);
        setError('Failed to load saved recipes');
        setLoading(false);
      } finally {
        setLoadingRecipes(false);
      }
    };

    if (!recipeID) {
      fetchSavedRecipes();
    }
  }, [userId, recipeID]);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      console.log('fetchRecipeDetails called with:', { recipeID, servingCount, fractionValue });
      
      if (!recipeID) {
        return;
      }

      try {
        // First try to get the recipe from saved-recipes to use stored nutrition data
        // This works around the server bug in /log-recipe endpoint
        let recipeData: any = null;
        if (userId) {
          try {
            const recipesResponse = await api.get(`api/saved-recipes/${userId}`);
            if (recipesResponse.ok) {
              const recipes = await recipesResponse.json() as any[];
              recipeData = recipes.find((r: any) => r._id === recipeID);
              if (recipeData) {
                console.log('Recipe data from saved-recipes:', recipeData);
              }
            }
          } catch (err) {
            console.log('Saved-recipes fetch failed, trying log-recipe endpoint:', err);
          }
        }

        // If we have recipe data with nutrition, use it
        // Otherwise fall back to the log-recipe endpoint (which has a bug)
        let responseData: RecipeDetails;
        
        if (recipeData && recipeData.nutrition) {
          // Use stored nutrition data from recipe
          const totalServings = servingCount + fractionValue;
          const nutrition = recipeData.nutrition;
          
          responseData = {
            recipeName: recipeData.recipeName,
            selectedServing: {
              serving_description: recipeData.servingSize || '1 serving'
            },
            nutrition: {
              caloriesPerServing: (nutrition.caloriesPerServing || 0) * totalServings,
              carbohydratePerServing: (nutrition.carbohydratePerServing || 0) * totalServings,
              proteinPerServing: (nutrition.proteinPerServing || 0) * totalServings,
              fatPerServing: (nutrition.fatPerServing || 0) * totalServings,
              saturatedFatPerServing: (nutrition.saturatedFatPerServing || 0) * totalServings,
              sodiumPerServing: (nutrition.sodiumPerServing || 0) * totalServings,
              fiberPerServing: (nutrition.fiberPerServing || 0) * totalServings,
            }
          };
          console.log('Using stored recipe nutrition data:', responseData);
          setError(null);
        } else {
          // Fall back to log-recipe endpoint
          console.log('Making API call to:', `api/log-recipe/${recipeID}?servings=${servingCount + fractionValue}`);
          const response = await api.get(`api/log-recipe/${recipeID}?servings=${servingCount + fractionValue}`);
          
          if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
          }
          
          responseData = await response.json();
          console.log('API response from log-recipe:', responseData);

          // Check if nutrition data exists - if not, use default values and show a warning
          const hasNutritionData = responseData.nutrition && Object.keys(responseData.nutrition).length > 0;
          
          if (!hasNutritionData) {
            console.warn('⚠️ Recipe nutrition data is missing from server. Using default values of 0.');
            setError('Warning: Nutrition data is not available for this recipe. Values will show as 0.');
          } else {
            setError(null);
          }
        }

        setFoodDetails(responseData);

        // Use nullish coalescing to provide default values of 0 if nutrition data is missing
        const serving: Serving = {
          serving_description: responseData.selectedServing?.serving_description || '1 serving',
          calories: responseData.nutrition?.caloriesPerServing ?? 0,
          carbohydrate: responseData.nutrition?.carbohydratePerServing ?? 0,
          protein: responseData.nutrition?.proteinPerServing ?? 0,
          fat: responseData.nutrition?.fatPerServing ?? 0,
          saturated_fat: responseData.nutrition?.saturatedFatPerServing ?? 0,
          sodium: responseData.nutrition?.sodiumPerServing ?? 0,
          fiber: responseData.nutrition?.fiberPerServing ?? 0,
          serving_id: 'S-custom'
        };

        setSelectedServing(serving);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recipe details:', err);
        setError(`Failed to load recipe details: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    if (recipeID && userId) {
      fetchRecipeDetails();
    }
  }, [recipeID, servingCount, fractionValue, userId]);

  const fractionToFloat = (fractionStr: string) => {
    if (fractionStr === '0') return 0;
    const [numerator, denominator] = fractionStr.split('/');
    return parseFloat(numerator) / parseFloat(denominator);
  };

  const handleFractionCount = (fractionStr: string) => {
    const fraction = fractionToFloat(fractionStr);
    setFractionCount(fractionStr);
    setFractionValue(fraction);
  };

  const handleRecipeSelect = (recipe: SavedRecipe) => {
    router.push(`/logFromRecipe?recipeID=${recipe._id}&recipeName=${encodeURIComponent(recipe.recipeName)}`);
  };

  const handleAddFood = async () => {
    if (!selectedServing || !meal || !userId) {
      Alert.alert('Error', 'Please select serving size, number of servings, and meal type.');
      return;
    }

    try {
      const totalServings = servingCount + fractionValue;

      // Ensure all nutrition values are numbers (not NaN) before calculating totals
      const safeCalories = (selectedServing.calories || 0) * totalServings;
      const safeCarbohydrate = (selectedServing.carbohydrate || 0) * totalServings;
      const safeProtein = (selectedServing.protein || 0) * totalServings;
      const safeFat = (selectedServing.fat || 0) * totalServings;
      const safeSaturatedFat = (selectedServing.saturated_fat || 0) * totalServings;
      const safeSodium = (selectedServing.sodium || 0) * totalServings;
      const safeFiber = (selectedServing.fiber || 0) * totalServings;

      const foodEntry = {
        user_id: userId,
        food_name: recipeName,
        serving_size: selectedServing.serving_description,
        number_of_servings: servingCount,
        fraction_of_serving: fractionValue,
        calories: safeCalories,
        carbohydrate: safeCarbohydrate,
        protein: safeProtein,
        fat: safeFat,
        saturated_fat: safeSaturatedFat,
        sodium: safeSodium,
        fiber: safeFiber,
        meal_type: meal.toLowerCase(),
        food_type: 'recipe'
      };

      // Create OneFood document
      const foodResponse = await api.post('api/one-food', {
        json: foodEntry,
      });
      const foodData = await foodResponse.json() as any;

      if (!foodResponse.ok) {
        throw new Error('Failed to create food entry.');
      }

      // Add the food entry to the DailyLog - server will calculate the date
      // This matches how the web app works - no date parameter sent
      const dailyLogResponse = await api.post('api/daily-log', {
        json: {
          user_id: userId,
          foods: [foodData._id],
        },
      });

      if (dailyLogResponse.ok) {
        const dailyLogData = await dailyLogResponse.json() as any;
        
        // Cache the food data so dashboard can find it immediately
        // This works around the server issue where .findOne() only returns the oldest daily log
        const { cacheFood } = require('@/utils/foodCache');
        let storedDateStr = '';
        if (dailyLogData.dateCreated) {
          const storedDate = new Date(dailyLogData.dateCreated);
          const DateTime = require('luxon').DateTime;
          storedDateStr = DateTime.fromJSDate(storedDate).toFormat('yyyy-MM-dd');
        }
        cacheFood(foodData as any, storedDateStr);
        console.log('✅ Cached recipe food for dashboard');
        
        Alert.alert('Success', 'Recipe logged successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', 'Failed to log recipe.');
      }
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Failed to log recipe. Please try again.');
    }
  };

  // Show saved recipes list if no recipe is selected
  if (!recipeID) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Log From Recipe",
          }}
        />
        <LinearGradient colors={['#00b4d8', '#0077b6', '#023e8a']} style={styles.gradient}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Select a Recipe to Log</Text>
            
            {loadingRecipes ? (
              <Text style={styles.loadingText}>Loading your recipes...</Text>
            ) : savedRecipes.length > 0 ? (
              savedRecipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe._id}
                  style={styles.recipeItem}
                  onPress={() => handleRecipeSelect(recipe)}
                >
                  <Text style={styles.recipeName}>{recipe.recipeName}</Text>
                  <Text style={styles.recipeDetails}>
                    Servings: {recipe.servings} | Size: {recipe.servingSize}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="book-open-page-variant"
                  size={64}
                  color="white"
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>No saved recipes found</Text>
                <Text style={styles.emptySubtext}>
                  Create recipes in the Recipe tab to log them here
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => router.push('/(tabs)/recipe')}
                >
                  <Text style={styles.buttonText}>Go to Recipe Tab</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#00b4d8', '#0077b6', '#023e8a']} style={styles.gradient}>
          <View style={styles.content}>
            <Text style={styles.loadingText}>Loading recipe details...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Only show error screen if there's a critical error (not just a warning)
  // If error is a warning about missing nutrition data, still show the recipe
  if (!foodDetails && error && !error.includes('Warning:')) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#00b4d8', '#0077b6', '#023e8a']} style={styles.gradient}>
          <View style={styles.content}>
            <Text style={styles.errorText}>{error || 'Failed to load recipe details'}</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.back()}>
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const totalServings = servingCount + fractionValue;
  const stats = selectedServing ? [
    { name: 'Carbs', value: (selectedServing.carbohydrate || 0) * totalServings },
    { name: 'Protein', value: (selectedServing.protein || 0) * totalServings },
    { name: 'Fat', value: (selectedServing.fat || 0) * totalServings },
    { name: 'Calories', value: (selectedServing.calories || 0) * totalServings }
  ] : [];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: recipeName as string || "Log Recipe",
          headerRight: () => (
            <TouchableOpacity onPress={handleAddFood} style={styles.addButton}>
              <MaterialCommunityIcons name="plus" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <LinearGradient colors={['#00b4d8', '#0077b6', '#023e8a']} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {error && error.includes('Warning:') && (
            <View style={styles.warningBanner}>
              <MaterialCommunityIcons name="alert" size={20} color="#FFA500" />
              <Text style={styles.warningText}>{error}</Text>
            </View>
          )}
          {selectedServing && (
            <View style={styles.nutritionCard}>
              <View style={styles.nutritionRow}>
                <View style={styles.nutritionColumn}>
                  <View style={styles.inlineRow}>
                    <Text style={styles.label}>Calories: </Text>
                    <Text style={styles.value}>{((selectedServing.calories || 0) * totalServings).toFixed(1)}</Text>
                  </View>
                </View>
                <View style={styles.nutritionColumn}>
                  <View style={styles.inlineRow}>
                    <Text style={styles.label}>Carbs: </Text>
                    <Text style={styles.value}>{((selectedServing.carbohydrate || 0) * totalServings).toFixed(1)}g</Text>
                  </View>
                </View>
              </View>
              <View style={styles.nutritionRow}>
                <View style={styles.nutritionColumn}>
                  <View style={styles.inlineRow}>
                    <Text style={styles.label}>Protein: </Text>
                    <Text style={styles.value}>{((selectedServing.protein || 0) * totalServings).toFixed(1)}g</Text>
                  </View>
                </View>
                <View style={styles.nutritionColumn}>
                  <View style={styles.inlineRow}>
                    <Text style={styles.label}>Fat: </Text>
                    <Text style={styles.value}>{((selectedServing.fat || 0) * totalServings).toFixed(1)}g</Text>
                  </View>
                </View>
              </View>
              <View style={styles.nutritionRow}>
                <View style={styles.nutritionColumn}>
                  <View style={styles.inlineRow}>
                    <Text style={styles.label}>Saturated Fat: </Text>
                    <Text style={styles.value}>{((selectedServing.saturated_fat || 0) * totalServings).toFixed(1)}g</Text>
                  </View>
                </View>
                <View style={styles.nutritionColumn}>
                  <View style={styles.inlineRow}>
                    <Text style={styles.label}>Sodium: </Text>
                    <Text style={styles.value}>{((selectedServing.sodium || 0) * totalServings).toFixed(1)}mg</Text>
                  </View>
                </View>
              </View>
              <View style={styles.nutritionRow}>
                <View style={styles.nutritionColumn}>
                  <View style={styles.inlineRow}>
                    <Text style={styles.label}>Fiber: </Text>
                    <Text style={styles.value}>{((selectedServing.fiber || 0) * totalServings).toFixed(1)}g</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.chartContainer}>
            <DonutChart stats={stats} />
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <DropdownSelect
                label="Number of Servings"
                value={servingCount}
                items={Array.from({ length: 101 }, (_, i) => i)}
                onValueChange={setServingCount}
                getLabel={(item) => item.toString()}
              />
            </View>
            <View style={styles.halfWidth}>
              <DropdownSelect
                label="Fraction of Serving"
                value={fractionCount}
                items={fractions}
                onValueChange={handleFractionCount}
                getLabel={(item) => item}
              />
            </View>
          </View>

          <DropdownSelect
            label="Meal Type"
            value={meal}
            items={mealTypes}
            onValueChange={setMeal}
            getLabel={(item) => item}
          />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  scrollView: {
    flex: 1,
  },
  nutritionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionColumn: {
    flex: 1,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#B0BEC5',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  addButton: {
    marginRight: 8,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#34D399',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  recipeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  recipeDetails: {
    fontSize: 14,
    color: '#B0BEC5',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#B0BEC5',
    textAlign: 'center',
    marginBottom: 20,
  },
  warningBanner: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  warningText: {
    color: '#FFA500',
    fontSize: 14,
    flex: 1,
  },
}); 