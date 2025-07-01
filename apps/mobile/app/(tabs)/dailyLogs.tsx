import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DateTime } from 'luxon';
import ky from 'ky';
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
  message?: string;
}

export default function DailyLogs() {
  const router = useRouter();
  const [logHistory, setLogHistory] = useState<Food[]>([]);
  const [logMessage, setLogMessage] = useState('');
  const [date, setDate] = useState(DateTime.now());

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

      // Format date in NY timezone
      // Helper to actually call your GET:
      async function fetchFor(dateStr: string) {
        console.log('📅 fetching logs for date:', dateStr);
        return api
          .get(`api/foodByDate/${userId}/date/${dateStr}`)
          .json<ApiResponse>();
      }

      // Compute the selected date in NY timezone
      const selectedDateStr = date
        .setZone('America/New_York')
        .startOf('day')
        .toFormat('yyyy-MM-dd');

      // Fetch data for the selected date
      const response = await fetchFor(selectedDateStr);

      // Update state based on response
      if (response.foods?.length) {
        setLogHistory(response.foods);
        setLogMessage('');
      } else {
        setLogHistory([]);
        setLogMessage('No food has been logged for this day.');
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
              await api.delete(`api/deleteFood/${userId}/${foodId}/${formattedDate}`);
              const newLogHistory = logHistory.filter(food => food._id !== foodId);
              setLogHistory(newLogHistory);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting food:', error);
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
          Calories: {food.calories.toFixed(1)} | Carb: {food.carbohydrate.toFixed(1)} |
          Protein: {food.protein.toFixed(1)} | Fat: {food.fat.toFixed(1)}
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
}); 