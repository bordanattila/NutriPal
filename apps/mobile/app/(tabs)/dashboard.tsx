import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { mobileAuthService as Auth } from "@/utils/authServiceMobile";
import ky from 'ky';
import { DateTime } from 'luxon';
import Footer from '@/components/Footer';
import DonutChart from '@/components/DonutChart';

interface FoodLog {
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  fiber: number;
  sodium: number;
  saturated_fat: number;
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

  // State for nutrient totals
  const [totals, setTotals] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    fiber: 0,
    sodium: 0,
    saturatedFat: 0
  });

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

      const response = await api.get(`api/foodByDate/${userId}/date/${date.toISODate()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: any = await response.json();
      setDashboardData({
        foods: data.message === "No food has been logged for this day." ? [] : (data.foods || []),
        calorieGoal: data.calorieGoal
      });
      setCalorieGoal(data.calorieGoal);
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

  useEffect(() => {
    const calculateTotals = () => {
      const newTotals = dashboardData.foods.reduce((acc, food) => ({
        calories: acc.calories + (food.calories || 0),
        carbs: acc.carbs + (food.carbohydrate || 0),
        protein: acc.protein + (food.protein || 0),
        fat: acc.fat + (food.fat || 0),
        fiber: acc.fiber + (food.fiber || 0),
        sodium: acc.sodium + (food.sodium || 0),
        saturatedFat: acc.saturatedFat + (food.saturated_fat || 0)
      }), {
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
        fiber: 0,
        sodium: 0,
        saturatedFat: 0
      });

      setTotals(newTotals);
    };

    calculateTotals();
  }, [dashboardData.foods]);

  const stats = [
    { name: 'Carbs', value: totals.carbs },
    { name: 'Protein', value: totals.protein },
    { name: 'Fat', value: totals.fat },
    { name: 'Calories', value: totals.calories },
  ];

  const statsBottom = [
    { name: 'Sodium', value: totals.sodium },
    { name: 'Fiber', value: totals.fiber },
    { name: 'Saturated Fat', value: totals.saturatedFat },
  ];

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
          
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Carb</Text>
                <Text style={styles.statValue}>{totals.carbs.toFixed(1)}g</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Protein</Text>
                <Text style={styles.statValue}>{totals.protein.toFixed(1)}g</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Fat</Text>
                <Text style={styles.statValue}>{totals.fat.toFixed(1)}g</Text>
              </View>
            </View>
            
            <View style={styles.rowDivider} />
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Calories</Text>
                <Text style={styles.statValue}>{totals.calories.toFixed(1)} kcal</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Goal</Text>
                <Text style={styles.statValue}>{(calorieGoal || 0).toFixed(1)} kcal</Text>
              </View>
            </View>
          </View>

          <DonutChart stats={stats} />

          <View style={styles.statsContainer}>
            {statsBottom.map((stat) => (
              <View key={stat.name} style={styles.statItem}>
                <Text style={styles.statLabel}>{stat.name}</Text>
                <Text style={styles.statValue}>
                  {stat.value.toFixed(1)}{stat.name === 'Sodium' ? 'mg' : 'g'}
                </Text>
              </View>
            ))}
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statsCard: {
    flexDirection: 'column',
    backgroundColor: '#00b4d8',
    borderRadius: 8,
    marginBottom: 20,
    marginHorizontal: 4,
    padding: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 4,
    marginHorizontal: 12,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
}); 