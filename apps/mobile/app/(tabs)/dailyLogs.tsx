import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DateTime } from 'luxon';
import ky from 'ky';
import { useQuery } from '@apollo/client';
import { GET_USER } from '@/utils/mutations';
import { mobileAuthService as Auth } from "@/utils/authServiceMobile";
import Footer from '@/components/Footer';
import Calendar from '@/components/Calendar';
import { JwtPayload } from 'jwt-decode';

interface CustomJwtPayload extends JwtPayload {
  data?: {
    _id?: string;
    id?: string;
  };
  _id?: string;
  id?: string;
}

const api = ky.create({
  prefixUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.14:4000',
});

interface Food {
  _id: string;
  food_id: string;
  food_name: string;
  brand?: string;
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  meal_type: string;
  number_of_servings: number;
  serving_size: string;
}

interface ApiResponse {
  foods?: Food[];
  waterCups?: number;
  message?: string;
}

export default function DailyLogs() {
  const router = useRouter();
  const [logHistory, setLogHistory] = useState<Food[]>([]);
  const [waterCups, setWaterCups] = useState(0);
  const [logMessage, setLogMessage] = useState('');
  const [date, setDate] = useState(DateTime.now());

  const { data: userData } = useQuery(GET_USER, {
    onError: (error) => {
      console.error('Error fetching user data:', error);
    }
  });
  const waterUnit: string = userData?.user?.waterUnit || 'cups';
  const toDisplay = (cups: number) => waterUnit === 'oz' ? cups * 8 : cups;
  const getUnitLabel = (value: number) => waterUnit === 'oz' ? 'oz' : (value === 1 ? 'cup' : 'cups');

  const fetchLogHistory = async () => {
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

      // Helper to query a date
      async function fetchFor(dateStr: string): Promise<ApiResponse> {
        console.log('📅 fetching logs for date:', dateStr);
        try {
          return await api
            .get(`api/foodByDate/${userId}/date/${dateStr}`)
            .json<ApiResponse>();
        } catch (error) {
          return { message: "No food has been logged for this day." };
        }
      }

      // Compute the selected date in America/New_York timezone to match server
      const selectedDateStr = date.setZone('America/New_York').toFormat('yyyy-MM-dd');

      // Query the selected date
      const selectedData = await fetchFor(selectedDateStr);

      // Get cached foods only for the selected date
      const { getCachedFoods } = require('@/utils/foodCache');
      const cachedFoodsSelected = getCachedFoods(selectedDateStr);

      // Helper to check if a food was created on the selected date
      const isFoodForSelectedDate = (food: any): boolean => {
        if (!food.created) return false;
        const foodCreated = DateTime.fromISO(food.created).setZone('America/New_York');
        const selectedDateStart = date.setZone('America/New_York').startOf('day');
        const selectedDateEnd = date.setZone('America/New_York').endOf('day');
        return foodCreated >= selectedDateStart && foodCreated <= selectedDateEnd;
      };

      // Helper to filter foods with valid nutrition data
      const hasValidNutrition = (food: any): boolean => {
        return food.calories !== null && food.calories !== undefined &&
               (food.carbohydrate !== null || food.protein !== null || food.fat !== null);
      };

      // Collect foods that belong to the selected date
      const allFoods: any[] = [];
      
      // Add foods from selected date's daily log
      if (selectedData.foods) {
        const validFoods = selectedData.foods.filter((f: any) => 
          hasValidNutrition(f) && isFoodForSelectedDate(f)
        );
        allFoods.push(...validFoods);
      }

      // Add cached foods that match the selected date
      const cachedFoods = getCachedFoods(selectedDateStr);
        if (cachedFoods.length > 0) {
          const existingIds = new Set(allFoods.map(f => f._id));
          cachedFoods.forEach((cachedFood: any) => {
            if (!existingIds.has(cachedFood._id) && isFoodForSelectedDate(cachedFood)) {
              allFoods.push(cachedFood);
            }
          });
        }

      const serverWater = ('waterCups' in selectedData) ? (selectedData.waterCups ?? 0) : 0;

      if (allFoods.length > 0) {
        setLogHistory(allFoods);
        setWaterCups(serverWater);
        setLogMessage('');
      } else {
        setLogHistory([]);
        setWaterCups(serverWater);
        setLogMessage(serverWater > 0 ? '' : 'No food has been logged for this day.');
      }
    } catch (error) {
      console.error('Error fetching food logs:', error);
      setLogMessage('Failed to fetch food logs');
    }
  };

  useEffect(() => {
    fetchLogHistory();
  }, [date]);

  const mealTypeOrder = ["breakfast", "lunch", "dinner", "snack"];

  const groupedLogs = mealTypeOrder.map(mealType => ({
    mealType,
    foods: logHistory.filter(food => food.meal_type === mealType),
  }));

  const handleDelete = async (foodId: string) => {
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

      const formattedDate = date.toFormat('yyyy-MM-dd');

      Alert.alert(
        "Delete Food",
        "Are you sure you want to delete this food item?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                // Try deleting with the selected date first
                let deleted = false;
                try {
                  await api.delete(`api/deleteFood/${userId}/${foodId}/${formattedDate}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  deleted = true;
                } catch (error: any) {
                  // If that fails, try with yesterday's date (server might have stored it there)
                  // due to timezone adjustments
                  if (error.response?.status === 404 || error.response?.status === 400) {
                    try {
                      const yesterday = date.minus({ days: 1 }).toFormat('yyyy-MM-dd');
                      await api.delete(`api/deleteFood/${userId}/${foodId}/${yesterday}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      deleted = true;
                    } catch (yesterdayError) {
                      console.error('Delete failed for both dates:', yesterdayError);
                      throw yesterdayError;
                    }
                  } else {
                    throw error;
                  }
                }

                if (deleted) {
                  // Clear the food from cache
                  const { clearCache } = require('@/utils/foodCache');
                  clearCache(formattedDate);
                  const yesterday = date.minus({ days: 1 }).toFormat('yyyy-MM-dd');
                  clearCache(yesterday);

                  // Refresh the log history from the server
                  await fetchLogHistory();
                }
              } catch (error) {
                console.error('Error deleting food:', error);
                Alert.alert("Error", "Failed to delete food item. Please try again.");
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in handleDelete:', error);
      Alert.alert("Error", "Failed to delete food item");
    }
  };

  const renderFoodItem = (food: Food) => (
    <Pressable
      key={food._id}
      style={styles.foodItem}
      onPress={() => router.push(`/foodDetails/${food.food_id}`)}
    >
      <View style={styles.foodContent}>
        <Text style={styles.foodName}>
          {food.food_name}
          {food.brand && <Text style={styles.brandName}> ({food.brand})</Text>}
        </Text>
        <Text style={styles.nutritionInfo}>
          Calories: {(food.calories ?? 0).toFixed(1)} | Carb: {(food.carbohydrate ?? 0).toFixed(1)} |
          Protein: {(food.protein ?? 0).toFixed(1)} | Fat: {(food.fat ?? 0).toFixed(1)}
        </Text>
        <Text style={styles.servingInfo}>
          Servings: {food.number_of_servings} | Size: {food.serving_size}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(food._id)}
      >
        <MaterialCommunityIcons name="delete" size={24} color="#dc2626" />
      </TouchableOpacity>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00b4d8', '#0077b6', '#023e8a']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Calendar
            value={date}
            onChange={setDate}
          />

          {(logHistory.length > 0 || waterCups > 0) && (
            <View style={styles.waterSummary}>
              <MaterialCommunityIcons name="cup-water" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.waterSummaryText}>
                Water: {toDisplay(waterCups)} {getUnitLabel(toDisplay(waterCups))}
              </Text>
            </View>
          )}

          {logHistory.length > 0 ? (
            <>
              {groupedLogs.map(group => (
                group.foods.length > 0 && (
                  <View key={group.mealType} style={styles.mealGroup}>
                    <Text style={styles.mealTitle}>
                      {group.mealType.charAt(0).toUpperCase() + group.mealType.slice(1)}
                    </Text>
                    {group.foods.map(renderFoodItem)}
                  </View>
                )
              ))}
            </>
          ) : (
            <Text style={styles.message}>{logMessage}</Text>
          )}
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
  mealGroup: {
    gap: 8,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 8,
    textTransform: 'uppercase',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    paddingBottom: 8,
  },
  foodItem: {
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
  foodContent: {
    flex: 1,
    marginRight: 8,
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
  nutritionInfo: {
    fontSize: 12,
    color: '#444',
    marginBottom: 2,
  },
  servingInfo: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  message: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  waterSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  waterSummaryText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
}); 