import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { mobileAuthService as Auth } from "@/utils/authServiceMobile";
import ky from 'ky';
import { DateTime } from 'luxon';
import Footer from '@/components/Footer';

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
}

const api = ky.create({
  prefixUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.13:4000',
});

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({ foods: [] });
  const [date, setDate] = useState(DateTime.now());
  const [calorieGoal, setCalorieGoal] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const isLoggedIn = await Auth.loggedIn();
      if (!isLoggedIn) {
        router.replace('/login');
        return;
      }

      const token = await Auth.getToken();
      if (!token) {
        console.log('No token found');
        router.replace('/login');
        return;
      }

      const profile = await Auth.getProfile();
      if (!profile) {
        console.log('No profile found');
        router.replace('/login');
        return;
      }

      const userId = profile.data?._id || profile.data?.id || profile._id || profile.id;
      if (!userId) {
        console.log('Profile data:', profile);
        router.replace('/login');
        return;
      }

      const response = await api.get(`api/foodByDate/${userId}/date/${date.toISODate()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: any = await response.json();

      const dashboardData: DashboardData = {
        foods: data.message === "No food has been logged for this day." ? [] : (data.foods || []),
        calorieGoal: data.calorieGoal
      };
      setDashboardData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [date]);

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
    <View style={styles.container}>
      <LinearGradient
        colors={['#00b4d8', '#0077b6', '#023e8a']}
        style={styles.gradient}
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0077b6',
  },
}); 