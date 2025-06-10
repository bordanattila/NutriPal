import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ky from 'ky';
import { mobileAuthService as Auth } from "@/utils/authServiceMobile";
import { getAccessTokenValue } from '@/utils/apiAuth';
import DonutChart from '@/components/DonutChart';
import DropdownSelect from '@/components/DropdownSelect';

interface Serving {
  serving_id: string;
  serving_description: string;
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  saturated_fat: number;
  sodium: number;
  fiber: number;
}

interface FoodDetails {
  food: {
    food_id: string;
    food_name: string;
    brand_name?: string;
    food_url?: string;
    servings: {
      serving: Serving[];
    };
  };
}

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const fractions = ['0', '1/8', '1/4', '1/3', '3/8', '1/2', '5/8', '2/3', '3/4', '7/8'];

export default function FoodDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [foodDetails, setFoodDetails] = useState<FoodDetails | null>(null);
  const [selectedServing, setSelectedServing] = useState<Serving | null>(null);
  const [servingCount, setServingCount] = useState(1);
  const [fractionCount, setFractionCount] = useState('0');
  const [meal, setMeal] = useState(mealTypes[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        const token = await getAccessTokenValue();
        if (!token) {
          setError('Failed to authenticate');
          return;
        }

        const response = await ky.get('https://platform.fatsecret.com/rest/server.api', {
          searchParams: {
            method: 'food.get.v2',
            food_id: id,
            format: 'json'
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).json<{ food: FoodDetails }>();

        setFoodDetails(response.food);
        if (response.food?.servings?.serving?.length > 0) {
          setSelectedServing(response.food.servings.serving[0]);
        }
      } catch (err) {
        console.error('Error fetching food details:', err);
        setError('Failed to fetch food details');
      } finally {
        setLoading(false);
      }
    };

    fetchFoodDetails();
  }, [id]);

  const fractionToFloat = (fractionStr: string) => {
    if (fractionStr === '0') return 0;
    const [numerator, denominator] = fractionStr.split('/');
    return parseFloat(numerator) / parseFloat(denominator);
  };

  const handleAddFood = async () => {
    if (!selectedServing || !meal) {
      setError('Please select serving size and meal type');
      return;
    }

    try {
      const token = await Auth.getToken();
      if (!token) {
        router.replace('/login');
        return;
      }

      const profile = await Auth.getProfile();
      if (!profile) {
        router.replace('/login');
        return;
      }

      const userId = profile.data?._id || profile.data?.id || profile._id || profile.id;
      if (!userId) {
        router.replace('/login');
        return;
      }

      const totalServings = servingCount + fractionToFloat(fractionCount);

      const foodEntry = {
        user_id: userId,
        food_id: foodDetails?.food.food_id,
        food_name: foodDetails?.food.food_name,
        serving_id: selectedServing.serving_id,
        serving_size: selectedServing.serving_description,
        number_of_servings: servingCount,
        fraction_of_serving: fractionToFloat(fractionCount),
        calories: selectedServing.calories * totalServings,
        carbohydrate: selectedServing.carbohydrate * totalServings,
        protein: selectedServing.protein * totalServings,
        fat: selectedServing.fat * totalServings,
        saturated_fat: selectedServing.saturated_fat * totalServings,
        sodium: selectedServing.sodium * totalServings,
        fiber: selectedServing.fiber * totalServings,
        brand: foodDetails?.food.brand_name,
        meal_type: meal.toLowerCase(),
      };

      // Create food entry
      const api = ky.create({
        prefixUrl: process.env.EXPO_PUBLIC_API_URL,
      });

      const foodResponse = await api.post('api/one-food', {
        json: foodEntry,
      }).json();

      // Add to daily log
      await api.post('api/daily-log', {
        json: {
          user_id: userId,
          foods: [foodResponse._id],
          dateCreated: new Date().toISOString().split('T')[0],
        },
      });

      router.back();
    } catch (err) {
      console.error('Error adding food:', err);
      setError('Failed to add food');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error || !foodDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Failed to load food details'}</Text>
      </View>
    );
  }

  const stats = selectedServing ? [
    { name: 'Carbs', value: selectedServing.carbohydrate || 0 },
    { name: 'Protein', value: selectedServing.protein || 0 },
    { name: 'Fat', value: selectedServing.fat || 0 },
    { name: 'Calories', value: selectedServing.calories }
  ] : [];

  const totalServings = servingCount + fractionToFloat(fractionCount);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: foodDetails.food.food_name,
          headerRight: () => (
            <TouchableOpacity onPress={handleAddFood} style={styles.addButton}>
              <MaterialCommunityIcons name="plus" size={24} color="#00b4d8" />
            </TouchableOpacity>
          ),
        }}
      />
      <LinearGradient
        colors={['#00b4d8', '#0077b6', '#023e8a']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.nutritionCard}>
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionColumn}>
                <Text style={styles.label}>Calories:</Text>
                <Text style={styles.value}>{(selectedServing?.calories * totalServings).toFixed(1)}</Text>
              </View>
              <View style={styles.nutritionColumn}>
                <Text style={styles.label}>Carbs:</Text>
                <Text style={styles.value}>{(selectedServing?.carbohydrate * totalServings).toFixed(1)}g</Text>
              </View>
            </View>
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionColumn}>
                <Text style={styles.label}>Protein:</Text>
                <Text style={styles.value}>{(selectedServing?.protein * totalServings).toFixed(1)}g</Text>
              </View>
              <View style={styles.nutritionColumn}>
                <Text style={styles.label}>Fat:</Text>
                <Text style={styles.value}>{(selectedServing?.fat * totalServings).toFixed(1)}g</Text>
              </View>
            </View>
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionColumn}>
                <Text style={styles.label}>Saturated Fat:</Text>
                <Text style={styles.value}>{(selectedServing?.saturated_fat * totalServings).toFixed(1)}g</Text>
              </View>
              <View style={styles.nutritionColumn}>
                <Text style={styles.label}>Sodium:</Text>
                <Text style={styles.value}>{(selectedServing?.sodium * totalServings).toFixed(1)}mg</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <DonutChart stats={stats} />
          </View>

          <DropdownSelect
            label="Serving Size"
            value={selectedServing}
            items={foodDetails.food.servings.serving}
            onValueChange={setSelectedServing}
            getLabel={(item) => item.serving_description}
          />

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
                onValueChange={setFractionCount}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  nutritionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 