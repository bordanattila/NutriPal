import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ky from 'ky';
import { mobileAuthService as Auth } from "@/utils/authServiceMobile";
import SearchBar from '@/components/SearchBar';
import { handleSearch as handleFoodSearch } from '@/utils/searchUtils';
import { Food } from '../../types/food';
import { JwtPayload } from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';
import Footer from '@/components/Footer';

interface CustomJwtPayload extends JwtPayload {
  data?: {
    _id?: string;
    id?: string;
  };
  _id?: string;
  id?: string;
}

interface Ingredient {
  name: string;
  servingCount: number;
  servingSize: string;
  food_id: string;
  serving_id: string;
  fraction_of_serving: string;
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  saturated_fat: number;
  sodium: number;
  fiber: number;
  brand: string;
}

const api = ky.create({
  prefixUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.14:4000',
});

export default function RecipeScreen() {
  const router = useRouter();
  const [recipeName, setRecipeName] = useState('');
  const [numberOfServings, setNumberOfServings] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
  const [ingredientsID, setIngredientsID] = useState<string[]>([]);
  const [foodName, setFoodName] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
    loadStoredData();
  }, []);

  // Reload stored data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadStoredData();
    }, [])
  );

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

  const loadStoredData = async () => {
    try {
      const storedName = await SecureStore.getItemAsync('recipeName');
      const storedNumOfServings = await SecureStore.getItemAsync('numOfServings');
      const storedServingsSize = await SecureStore.getItemAsync('servingSize');
      const storedIngredients = await SecureStore.getItemAsync('ingredientsList');
      const storedIngredientsID = await SecureStore.getItemAsync('ingredientsID');

      if (storedName) setRecipeName(storedName);
      if (storedNumOfServings) setNumberOfServings(storedNumOfServings);
      if (storedServingsSize) setServingSize(storedServingsSize);
      if (storedIngredients) setIngredientsList(JSON.parse(storedIngredients));
      if (storedIngredientsID) setIngredientsID(JSON.parse(storedIngredientsID));
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  const handleSearch = async () => {
    if (foodName === '') {
      setError('Please enter a food name');
      return;
    }

    try {
      await handleFoodSearch({
        name: foodName,
        setArray: setSearchResults,
        setError: setError,
        setBarcode: () => {},
      });
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search for food');
    }
  };

  const clearSearch = () => {
    setFoodName('');
    setSearchResults([]);
    setError(null);
  };

  const clearIngredients = async () => {
    setIngredientsList([]);
    setIngredientsID([]);
    setRecipeName('');
    setNumberOfServings('');
    setServingSize('');
    
    try {
      await SecureStore.deleteItemAsync('ingredientsList');
      await SecureStore.deleteItemAsync('ingredientsID');
      await SecureStore.deleteItemAsync('recipeName');
      await SecureStore.deleteItemAsync('numOfServings');
      await SecureStore.deleteItemAsync('servingSize');
    } catch (error) {
      console.error('Error clearing stored data:', error);
    }
  };

  const handleRemoveIngredient = async (index: number) => {
    const updatedIngredients = ingredientsList.filter((_, i) => i !== index);
    const updatedIDs = ingredientsID.filter((_, i) => i !== index);

    setIngredientsList(updatedIngredients);
    setIngredientsID(updatedIDs);

    try {
      await SecureStore.setItemAsync('ingredientsList', JSON.stringify(updatedIngredients));
      await SecureStore.setItemAsync('ingredientsID', JSON.stringify(updatedIDs));
    } catch (error) {
      console.error('Error updating stored ingredients:', error);
    }
  };

  const handleAddRecipe = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!recipeName || !numberOfServings || !servingSize || ingredientsList.length === 0) {
      Alert.alert('Error', 'Please fill in all fields and add at least one ingredient');
      return;
    }

    try {
      const api = ky.create({
        prefixUrl: process.env.EXPO_PUBLIC_API_URL,
      });

      const foodEntryIds: string[] = [];

      for (const ingredient of ingredientsList) {
        console.log('Processing ingredient:', ingredient);
        
        // Validate required fields
        if (!ingredient.food_id || !ingredient.name || !ingredient.serving_id) {
          console.error('Missing required fields for ingredient:', ingredient);
          Alert.alert('Error', `Missing required data for ingredient: ${ingredient.name}`);
          return;
        }
        
        const foodEntry = {
          user_id: userId,
          food_id: ingredient.food_id,
          food_name: ingredient.name,
          serving_id: ingredient.serving_id,
          serving_size: ingredient.servingSize,
          number_of_servings: Number(ingredient.servingCount),
          fraction_of_serving: Number(ingredient.fraction_of_serving),
          calories: Number(ingredient.calories),
          carbohydrate: Number(ingredient.carbohydrate),
          protein: Number(ingredient.protein),
          fat: Number(ingredient.fat),
          saturated_fat: Number(ingredient.saturated_fat),
          sodium: Number(ingredient.sodium),
          fiber: Number(ingredient.fiber),
          brand: ingredient.brand || '',
          meal_type: 'snack',
          food_type: 'recipe',
        };

        console.log('Sending food entry:', foodEntry);

        try {
          const response = await api.post('api/one-food', {
            json: foodEntry,
          }).json() as { _id: string };

          console.log('Food entry created successfully:', response);
          foodEntryIds.push(response._id);
        } catch (foodError) {
          console.error('Error creating food entry:', foodError);
          console.error('Failed food entry data:', foodEntry);
          
          // Try to get more detailed error information
          if (foodError instanceof Error) {
            console.error('Error message:', foodError.message);
            if (foodError.message.includes('400')) {
              Alert.alert('Error', `Invalid data format for ${ingredient.name}. Please check ingredient information.`);
            } else {
              Alert.alert('Error', `Failed to create food entry for ${ingredient.name}: ${foodError.message}`);
            }
          } else {
            Alert.alert('Error', `Failed to create food entry for ${ingredient.name}`);
          }
          return;
        }
      }

      const newRecipe = {
        user_id: userId,
        recipeName: recipeName,
        ingredients: foodEntryIds,
        servings: parseInt(numberOfServings),
        servingSize: servingSize,
      };

      console.log('Creating recipe:', newRecipe);

      const recipeResponse = await api.post('api/recipe', {
        json: newRecipe,
      });

      if (recipeResponse.ok) {
        await clearIngredients();
        Alert.alert('Success', 'Recipe added successfully!');
      } else {
        Alert.alert('Error', 'Failed to add recipe');
      }
    } catch (error) {
      console.error('Error adding recipe:', error);
      Alert.alert('Error', 'Failed to add recipe. Please try again.');
    }
  };

  const renderFoodItem = (food: Food) => (
    <TouchableOpacity
      key={food.food_id}
      style={styles.foodItem}
      onPress={() => router.push(`/recipe/foodDetails/${food.food_id}`)}
    >
      <Text style={styles.foodName}>
        {food.food_name}
        {food.brand_name && <Text style={styles.brandName}> ({food.brand_name})</Text>}
      </Text>
      {food.food_description && (
        <Text style={styles.description}>{food.food_description}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00b4d8', '#0077b6', '#023e8a']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Recipe name"
              placeholderTextColor="#666"
              value={recipeName}
              onChangeText={async (text) => {
                setRecipeName(text);
                await SecureStore.setItemAsync('recipeName', text);
              }}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Number of servings"
              placeholderTextColor="#666"
              value={numberOfServings}
              onChangeText={async (text) => {
                setNumberOfServings(text);
                await SecureStore.setItemAsync('numOfServings', text);
              }}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Serving size (e.g., 1 plate)"
              placeholderTextColor="#666"
              value={servingSize}
              onChangeText={async (text) => {
                setServingSize(text);
                await SecureStore.setItemAsync('servingSize', text);
              }}
            />
          </View>

          <View style={styles.searchContainer}>
            <SearchBar
              nameOfFood={foodName}
              setNameOfFood={setFoodName}
              handleSearch={handleSearch}
              clearSearch={clearSearch}
              error={error}
            />
          </View>

          {searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              {searchResults.map(renderFoodItem)}
            </View>
          )}

          <View style={styles.ingredientsContainer}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {ingredientsList.length > 0 ? (
              ingredientsList.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientContent}>
                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                    <Text style={styles.ingredientDetails}>
                      Serving Count: {ingredient.servingCount} | Size: {ingredient.servingSize}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveIngredient(index)}
                  >
                    <MaterialCommunityIcons name="delete" size={24} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noIngredients}>No ingredients added</Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddRecipe}>
              <Text style={styles.saveButtonText}>Save Recipe</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.clearButton} onPress={clearIngredients}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <Footer />
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  formContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  searchContainer: {
    marginBottom: 8,
  },
  resultsContainer: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    paddingBottom: 8,
  },
  foodItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0077b6',
    marginBottom: 4,
  },
  brandName: {
    fontWeight: 'normal',
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  ingredientsContainer: {
    gap: 8,
  },
  ingredientItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  ingredientContent: {
    flex: 1,
    marginRight: 8,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0077b6',
    marginBottom: 4,
  },
  ingredientDetails: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    padding: 8,
  },
  noIngredients: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 