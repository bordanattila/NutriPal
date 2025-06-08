import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { mobileAuthService as Auth } from "@/utils/authServiceMobile";
import ky from 'ky';
import { DateTime } from 'luxon';
import { jwtDecode } from 'jwt-decode';

interface FoodLog {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  sodium: number;
  saturatedFat: number;
}

interface DashboardData {
  foods: FoodLog[];
  calorieGoal?: number;
};

const api = ky.create({
  prefixUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.13:4000',
});

export default function Dashboard() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({ foods: [] });
  const [date, setDate] = useState(DateTime.now());
  const [calorieGoal, setCalorieGoal] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // First check if we're logged in
      const isLoggedIn = await Auth.loggedIn();
      if (!isLoggedIn) {
        throw new Error('Not logged in');
      }

      // Get the token
      const token = await Auth.getToken();
      if (!token) {
        console.log('No token found');
        throw new Error('No token found');
      }

      // Get the profile
      const profile = await Auth.getProfile();
      if (!profile) {
        console.log('No profile found');
        throw new Error('No profile found');
      }

      // Try to get user ID from profile - it's nested inside data object
      const userId = profile.data?._id || profile.data?.id || profile._id || profile.id;
      if (!userId) {
        console.log('Profile data:', profile);
        throw new Error('User ID not found in token');
      }

      // Log the token and profile for debugging
      console.log('Token:', token);
      console.log('Profile:', profile);
      console.log('User ID:', userId);

      const response = await api.get(`api/foodByDate/${userId}/date/${date.toISODate()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: any = await response.json();
      console.log('API Response:', data); // Add logging to see the actual response

      // Handle case where no food has been logged
      const dashboardData: DashboardData = {
        foods: data.message === "No food has been logged for this day." ? [] : (data.foods || []),
        calorieGoal: data.calorieGoal
      };
      setDashboardData(dashboardData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data. Please try again.');
      setLoading(false);
      
      // If we get an unauthorized error, try to refresh the token
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        const refreshSuccess = await Auth.refreshToken();
        if (refreshSuccess) {
          fetchDashboardData();
        } else {
          Auth.logout();
          navigation.navigate('login');
        }
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [date]);

  useEffect(() => {
    const refreshTokenIfNeeded = async () => {
      const loggedIn = await Auth.loggedIn();
      if (!loggedIn) {
        const refreshSuccess = await Auth.refreshToken();
        if (!refreshSuccess) {
          Auth.logout();
          navigation.navigate('login');
        } else {
          fetchDashboardData();        }
      } else {
        fetchDashboardData();
      }
    };
    refreshTokenIfNeeded();
  }, []);

  if (loading) return (
    <View style={styles.container}>
      <Text>Loading...</Text>
    </View>
  );

  if (error) return (
    <View style={styles.container}>
      <Text style={styles.error}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton} 
        onPress={fetchDashboardData}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const calculateTotals = (foods: FoodLog[] | undefined | null) => {
    if (!foods || !Array.isArray(foods)) {
      return {
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
        fiber: 0,
        sodium: 0,
        saturatedFat: 0
      };
    }
    return foods.reduce((acc, food) => {
      return {
        calories: acc.calories + (food.calories || 0),
        carbs: acc.carbs + (food.carbs || 0),
        protein: acc.protein + (food.protein || 0),
        fat: acc.fat + (food.fat || 0),
        fiber: acc.fiber + (food.fiber || 0),
        sodium: acc.sodium + (food.sodium || 0),
        saturatedFat: acc.saturatedFat + (food.saturatedFat || 0)
      };
    }, {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
      saturatedFat: 0
    });
  };

  const totals = calculateTotals(dashboardData.foods);

  return (
    <LinearGradient
      colors={['#00b4d8', '#0077b6', '#023e8a']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Today's Nutrition</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statValue}>{totals.calories}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Carbs</Text>
            <Text style={styles.statValue}>{totals.carbs}g</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Protein</Text>
            <Text style={styles.statValue}>{totals.protein}g</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Fat</Text>
            <Text style={styles.statValue}>{totals.fat}g</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Fiber</Text>
            <Text style={styles.statValue}>{totals.fiber}g</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Sodium</Text>
            <Text style={styles.statValue}>{totals.sodium}mg</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Saturated Fat</Text>
            <Text style={styles.statValue}>{totals.saturatedFat}g</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('food')}
        >
          <Text style={styles.buttonText}>Add Food</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  statsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCard: {
    width: '45%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statLabel: {
    fontSize: 16,
    color: '#023e8a',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0077b6',
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    backgroundColor: '#00ff9d',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#023e8a',
  },
  error: {
    color: '#ff4444',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#00ff9d',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#023e8a',
    fontWeight: 'bold',
  },
});
