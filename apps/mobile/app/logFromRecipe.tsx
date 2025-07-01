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
        console.log('Making API call to:', `api/log-recipe/${recipeID}?servings=${servingCount + fractionValue}`);
        const response = await api.get(`api/log-recipe/${recipeID}?servings=${servingCount + fractionValue}`);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const responseData: RecipeDetails = await response.json();
        console.log('API response:', responseData);

        setFoodDetails(responseData);

        const serving: Serving = {
          serving_description: responseData.selectedServing.serving_description,
          calories: responseData.nutrition.caloriesPerServing,
          carbohydrate: responseData.nutrition.carbohydratePerServing,
          protein: responseData.nutrition.proteinPerServing,
          fat: responseData.nutrition.fatPerServing,
          saturated_fat: responseData.nutrition.saturatedFatPerServing,
          sodium: responseData.nutrition.sodiumPerServing,
          fiber: responseData.nutrition.fiberPerServing,
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

    if (recipeID) {
      fetchRecipeDetails();
    }
  }, [recipeID, servingCount, fractionValue]);

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
      const currentDate = DateTime.now().toFormat('yyyy-MM-dd');

      const foodEntry = {
        user_id: userId,
        food_name: recipeName,
        serving_size: selectedServing.serving_description,
        number_of_servings: servingCount,
        fraction_of_serving: fractionValue,
        calories: selectedServing.calories * totalServings,
        carbohydrate: selectedServing.carbohydrate * totalServings,
        protein: selectedServing.protein * totalServings,
        fat: selectedServing.fat * totalServings,
        saturated_fat: selectedServing.saturated_fat * totalServings,
        sodium: selectedServing.sodium * totalServings,
        fiber: selectedServing.fiber * totalServings,
        meal_type: meal.toLowerCase(),
        food_type: 'recipe'
      };

      // Create OneFood document
      const foodResponse = await api.post('api/one-food', {
        json: foodEntry,
      });
      const foodData = await foodResponse.json() as { _id: string };

      if (!foodResponse.ok) {
        throw new Error('Failed to create food entry.');
      }

      // Add the food entry to the DailyLog
      const dailyLogResponse = await api.post('api/daily-log', {
        json: {
          user_id: userId,
          foods: [foodData._id],
          dateCreated: currentDate,
        },
      });

      if (dailyLogResponse.ok) {
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

  if (error || !foodDetails) {
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
    { name: 'Carbs', value: selectedServing.carbohydrate * totalServings },
    { name: 'Protein', value: selectedServing.protein * totalServings },
    { name: 'Fat', value: selectedServing.fat * totalServings },
    { name: 'Calories', value: selectedServing.calories * totalServings }
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
          {selectedServing && (
            <View style={styles.nutritionCard}>
              <View style={styles.nutritionRow}>
                <View style={styles.nutritionColumn}>
                  <View style={styles.inlineRow}>
                    <Text style={styles.label}>Calories: </Text>
                    <Text style={styles.value}>{((selectedServing.calories * totalServings).toFixed(1))}</Text>
                  </View>
                </View>
                <View style={styles.nutritionColumn}>
                  <View style={styles.inlineRow}>
                    <Text style={styles.label}>Carbs: </Text>
                    <Text style={styles.value}>{((selectedServing.carbohydrate * totalServings).toFixed(1))}g</Text>
                  </View>
                </View>
              </View>
              <View style={styles.nutritionRow}>
                <View style={styles.nutritionColumn}>
                  <View style={styles.inlineRow}>
                    <Text style={styles.label}>Protein: </Text>
                    <Text style={styles.value}>{((selectedServing.protein * totalServings).toFixed(1))}g</Text>
                  </View>
                </View>
                <View style={styles.nutritionColumn}>
                  <View style={styles.inlineRow}>
                    <Text style={styles.label}>Fat: </Text>
                    <Text style={styles.value}>{((selectedServing.fat * totalServings).toFixed(1))}g</Text>
                  </View>
                </View>
              </View>
              <View style={styles.nutritionRow}>
                <View style={styles.nutritionColumn}>
                  <View style={styles.inlineRow}>
                    <Text style={styles.label}>Saturated Fat: </Text>
                    <Text style={styles.value}>{((selectedServing.saturated_fat * totalServings).toFixed(1))}g</Text>
                  </View>
                </View>
                <View style={styles.nutritionColumn}>
                  <View style={styles.inlineRow}>
                    <Text style={styles.label}>Sodium: </Text>
                    <Text style={styles.value}>{((selectedServing.sodium * totalServings).toFixed(1))}mg</Text>
                  </View>
                </View>
              </View>
              <View style={styles.nutritionRow}>
                <View style={styles.nutritionColumn}>
                  <View style={styles.inlineRow}>
                    <Text style={styles.label}>Fiber: </Text>
                    <Text style={styles.value}>{((selectedServing.fiber * totalServings).toFixed(1))}g</Text>
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
}); 