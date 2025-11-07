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
  food_id: string;
  food_name: string;
  brand_name?: string;
  food_url?: string;
  servings: {
    serving: Serving[];
  };
}

interface ApiResponse {
  food: FoodDetails;
}

interface FoodResponse {
  _id: string;
}

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const fractions = ['0', '1/8', '1/4', '1/3', '3/8', '1/2', '5/8', '2/3', '3/4', '7/8'];

export default function FoodDetailsScreen() {
  const { id } = useLocalSearchParams();
  const foodId = Array.isArray(id) ? id[0] : id;
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
            food_id: foodId,
            format: 'json'
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).json<ApiResponse>();

        console.log('API Response:', JSON.stringify(response, null, 2));
        console.log('First serving:', response.food?.servings?.serving?.[0]);

        // Normalize `servings.serving` into an array:
        const rawServings = response.food?.servings?.serving;
        const servingsArray: Serving[] = rawServings
          ? (Array.isArray(rawServings) ? rawServings : [rawServings])
          : [];

        setFoodDetails(response.food);

        if (servingsArray.length > 0) {
          setSelectedServing(servingsArray[0]);
        }

        console.log('First serving:', servingsArray[0]);
      } catch (err) {
        console.error('Error fetching food details:', err);
        setError('Failed to fetch food details');
      } finally {
        setLoading(false);
      }
    };

    fetchFoodDetails();
  }, [foodId]);

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

      const profile = await Auth.getProfile() as CustomJwtPayload;
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
        food_id: foodDetails?.food_id,
        food_name: foodDetails?.food_name,
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
        brand: foodDetails?.brand_name,
        meal_type: meal.toLowerCase(),
      };

      console.log('Adding food entry:', foodEntry);

      const api = ky.create({
        prefixUrl: process.env.EXPO_PUBLIC_API_URL,
      });

      const foodResponse = await api.post('api/one-food', {
        json: foodEntry,
      }).json() as FoodResponse;

      console.log('Food entry created:', foodResponse);

      // Add to daily log - server will calculate the date using its own DateTime.now()
      // This matches how the web app works - no date parameter sent
      const dailyLogResponse = await api.post('api/daily-log', {
        json: {
          user_id: userId,
          foods: [foodResponse._id],
        },
      }).json() as any;
      
      console.log('Successfully added food to daily log');
      console.log('Daily log response:', dailyLogResponse);
      
      // Log the date the server stored it under
      let storedDateStr = '';
      if (dailyLogResponse.dateCreated) {
        const storedDate = new Date(dailyLogResponse.dateCreated);
        storedDateStr = DateTime.fromJSDate(storedDate).toFormat('yyyy-MM-dd');
        console.log('📅 Server stored food under date:', storedDateStr);
      }
      
      // Cache the food data so dashboard can find it immediately
      // This works around the server issue where .findOne() only returns the oldest daily log
      const { cacheFood } = require('@/utils/foodCache');
      cacheFood(foodResponse as any, storedDateStr);
      console.log('✅ Cached food for dashboard:', (foodResponse as any).food_name);
      
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

  const totalServings = servingCount + fractionToFloat(fractionCount);

  const stats = selectedServing ? [
    { name: 'Carbs', value: Number(selectedServing.carbohydrate || 0) * totalServings },
    { name: 'Protein', value: Number(selectedServing.protein || 0) * totalServings },
    { name: 'Fat', value: Number(selectedServing.fat || 0) * totalServings },
    { name: 'Calories', value: Number(selectedServing.calories || 0) * totalServings }
  ] : [];

  console.log('Selected serving:', selectedServing);
  console.log('Total servings:', totalServings);
  console.log('Stats array:', stats);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: foodDetails?.food_name || "Food Details",
          headerRight: () => (
            <TouchableOpacity onPress={handleAddFood} style={styles.addButton}>
              <MaterialCommunityIcons name="plus" size={24} color="white" />
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
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Calories:  </Text>
                  <Text style={styles.value}>{((selectedServing?.calories || 0) * totalServings).toFixed(1)}</Text>
                </View>
              </View>
              <View style={styles.nutritionColumn}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Carbs:   </Text>
                  <Text style={styles.value}>{((selectedServing?.carbohydrate || 0) * totalServings).toFixed(1)}g</Text>
                </View>
              </View>
            </View>
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionColumn}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Protein:   </Text>
                  <Text style={styles.value}>{((selectedServing?.protein || 0) * totalServings).toFixed(1)}g</Text>
                </View>
              </View>
              <View style={styles.nutritionColumn}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Fat:   </Text>
                  <Text style={styles.value}>{((selectedServing?.fat || 0) * totalServings).toFixed(1)}g</Text>
                </View>
              </View>
            </View>
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionColumn}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Saturated Fat:   </Text>
                  <Text style={styles.value}>{((selectedServing?.saturated_fat || 0) * totalServings).toFixed(1)}g</Text>
                </View>
              </View>
              <View style={styles.nutritionColumn}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Sodium:   </Text>
                  <Text style={styles.value}>{((selectedServing?.sodium || 0) * totalServings).toFixed(1)}mg</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <DonutChart stats={stats} />
          </View>

          <DropdownSelect
            label="Serving Size"
            value={selectedServing}
            items={foodDetails.servings.serving}
            onValueChange={setSelectedServing}
            getLabel={(item) => item?.serving_description || ''}
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
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
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