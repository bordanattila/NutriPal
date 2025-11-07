import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DateTime } from 'luxon';
import { JwtPayload } from 'jwt-decode';
import { useQuery } from '@apollo/client';
import { GET_USER } from '@/utils/mutations';
import { client } from '@/utils/apollo';
import { ApolloProvider } from '@apollo/client';
import Footer from '@/components/Footer';
import DonutChart from '@/components/DonutChart';
import { mobileAuthService as Auth } from '@/utils/authServiceMobile';
import { getCachedFoods } from '@/utils/foodCache';
import ky from 'ky';

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
}

interface CustomJwtPayload extends JwtPayload {
  data?: {
    _id?: string;
    id?: string;
  };
}

interface ApiResponse {
  foods?: FoodLog[];
  message?: string;
}

const api = ky.create({
  prefixUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.14:4000',
});

function DashboardContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({ foods: [] });
  
  // Get user data including calorie goal
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USER, {
    onError: (error) => {
      console.error('Error fetching user data:', error);
      if (error.message.includes('Unauthorized')) {
        router.replace('/login');
      }
    }
  });
  
  const calorieGoal = userData?.user?.calorieGoal || 2000;
  
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
        console.log('Auth.loggedIn() returned false, redirecting to login');
        router.replace('/login');
        return;
      }

      const token = await Auth.getToken();
      console.log('Retrieved token:', token ? 'exists' : 'null');
      
      if (!token) {
        console.log('No token found, redirecting to login');
        router.replace('/login');
        return;
      }

      const profile = await Auth.getProfile() as CustomJwtPayload;
      console.log('Decoded profile:', profile);
      
      if (!profile) {
        console.log('No profile decoded from token, redirecting to login');
        router.replace('/login');
        return;
      }

      const userId = profile.data?._id || profile.data?.id;
      console.log('Extracted userId:', userId);
      
      if (!userId) {
        console.log('No userId found in profile, redirecting to login');
        router.replace('/login');
        return;
      }

      // Get current date in NY timezone and format it (matching server's DateTime.now().setZone('America/New_York'))
      async function queryDate(dateStr: string): Promise<ApiResponse> {
        console.log('📅 Dashboard fetch for date:', dateStr);
        const res = await api.get(`api/foodByDate/${userId}/date/${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
      }
      
      // Calculate dates - the server uses NY timezone with a 4-hour adjustment
      // This can cause food to be stored under the previous day
      // Query a wider range to catch all possible dates
      const now = DateTime.now();
      const today = now.toFormat('yyyy-MM-dd');
      const yesterday = now.minus({ days: 1 }).toFormat('yyyy-MM-dd');
      const tomorrow = now.plus({ days: 1 }).toFormat('yyyy-MM-dd');
      
      // Also check the day before yesterday (server's 4-hour adjustment can push dates back)
      const dayBeforeYesterday = now.minus({ days: 2 }).toFormat('yyyy-MM-dd');
      
      // Query multiple dates to handle server date calculation differences
      // The server uses NY timezone with a 4-hour adjustment which can store food under previous days
      const [todayData, yesterdayData, tomorrowData, dayBeforeYesterdayData] = await Promise.all([
        queryDate(today).catch(() => ({ message: "No food has been logged for this day." })),
        queryDate(yesterday).catch(() => ({ message: "No food has been logged for this day." })),
        queryDate(tomorrow).catch(() => ({ message: "No food has been logged for this day." })),
        queryDate(dayBeforeYesterday).catch(() => ({ message: "No food has been logged for this day." }))
      ]);
      
      // Log what each query returned for debugging
      console.log('📅 Today query result:', todayData.message ? 'No data' : `${todayData.foods?.length || 0} foods`);
      console.log('📅 Yesterday query result:', yesterdayData.message ? 'No data' : `${yesterdayData.foods?.length || 0} foods`);
      console.log('📅 Tomorrow query result:', tomorrowData.message ? 'No data' : `${tomorrowData.foods?.length || 0} foods`);
      console.log('📅 Day before yesterday query result:', dayBeforeYesterdayData.message ? 'No data' : `${dayBeforeYesterdayData.foods?.length || 0} foods`);
      
      // Debug: Log actual food data to see what we're getting
      if (todayData.foods && todayData.foods.length > 0) {
        console.log('📅 Today foods:', todayData.foods.map((f: any) => ({ 
          id: f._id, 
          name: f.food_name, 
          calories: f.calories, 
          carbs: f.carbohydrate, 
          protein: f.protein, 
          fat: f.fat 
        })));
      }
      if (yesterdayData.foods && yesterdayData.foods.length > 0) {
        console.log('📅 Yesterday foods:', yesterdayData.foods.map((f: any) => ({ 
          id: f._id, 
          name: f.food_name, 
          calories: f.calories, 
          carbs: f.carbohydrate, 
          protein: f.protein, 
          fat: f.fat,
          created: f.created
        })));
      }
      if (dayBeforeYesterdayData.foods && dayBeforeYesterdayData.foods.length > 0) {
        console.log('📅 Day before yesterday foods:', dayBeforeYesterdayData.foods.map((f: any) => ({ 
          id: f._id, 
          name: f.food_name, 
          calories: f.calories, 
          carbs: f.carbohydrate, 
          protein: f.protein, 
          fat: f.fat,
          created: f.created
        })));
      }
      if (tomorrowData.foods && tomorrowData.foods.length > 0) {
        console.log('📅 Tomorrow foods:', tomorrowData.foods.map((f: any) => ({ 
          id: f._id, 
          name: f.food_name, 
          calories: f.calories, 
          carbs: f.carbohydrate, 
          protein: f.protein, 
          fat: f.fat 
        })));
      }
      
      // Collect all foods from all dates, prioritizing today
      // Filter out foods with null nutrition values (they won't contribute to totals anyway)
      const allFoods: FoodLog[] = [];
      
      // Helper to filter foods with valid nutrition data
      const hasValidNutrition = (food: any): boolean => {
        return food.calories !== null && food.calories !== undefined &&
               (food.carbohydrate !== null || food.protein !== null || food.fat !== null);
      };
      
      // Get cached foods (recently added foods that might not be in query results yet)
      // This works around the server issue where .findOne() only returns the oldest daily log
      const cachedFoodsToday = getCachedFoods(today);
      const cachedFoodsYesterday = getCachedFoods(yesterday);
      const cachedFoodsTomorrow = getCachedFoods(tomorrow);
      const cachedFoodsDayBefore = getCachedFoods(dayBeforeYesterday);
      
      if (cachedFoodsToday.length > 0) {
        console.log(`📦 Found ${cachedFoodsToday.length} cached foods for today`);
      }
      if (cachedFoodsYesterday.length > 0) {
        console.log(`📦 Found ${cachedFoodsYesterday.length} cached foods for yesterday`);
      }
      
      // Add today's foods first (highest priority)
      if (todayData.foods && todayData.foods.length > 0) {
        const validFoods = todayData.foods.filter(hasValidNutrition);
        console.log(`📅 Adding ${validFoods.length} valid foods from today (${todayData.foods.length} total)`);
        allFoods.push(...validFoods);
      }
      
      // Add cached foods for today (recently added, might not be in query yet)
      if (cachedFoodsToday.length > 0) {
        const existingIds = new Set(allFoods.map(f => (f as any)._id));
        const newCachedFoods = cachedFoodsToday.filter(f => !existingIds.has(f._id));
        if (newCachedFoods.length > 0) {
          console.log(`📦 Adding ${newCachedFoods.length} cached foods for today`);
          allFoods.push(...newCachedFoods);
        }
      }
      
      // Add tomorrow's foods (edge case - server might have stored under tomorrow)
      if (tomorrowData.foods && tomorrowData.foods.length > 0) {
        const validFoods = tomorrowData.foods.filter(hasValidNutrition);
        // Only add foods that aren't already in the list (by _id)
        const existingIds = new Set(allFoods.map(f => (f as any)._id));
        const newFoods = validFoods.filter(f => !existingIds.has((f as any)._id));
        if (newFoods.length > 0) {
          console.log(`📅 Adding ${newFoods.length} valid foods from tomorrow`);
          allFoods.push(...newFoods);
        }
      }
      
      // Add day before yesterday's foods (server's 4-hour adjustment can push dates back)
      if (dayBeforeYesterdayData.foods && dayBeforeYesterdayData.foods.length > 0) {
        const validFoods = dayBeforeYesterdayData.foods.filter(hasValidNutrition);
        // Only add foods that aren't already in the list (by _id)
        const existingIds = new Set(allFoods.map(f => (f as any)._id));
        const newFoods = validFoods.filter(f => !existingIds.has((f as any)._id));
        if (newFoods.length > 0) {
          console.log(`📅 Adding ${newFoods.length} valid foods from day before yesterday`);
          allFoods.push(...newFoods);
        }
      }
      
      // Add cached foods for yesterday (recently added, might not be in query yet)
      if (cachedFoodsYesterday.length > 0) {
        const existingIds = new Set(allFoods.map(f => (f as any)._id));
        const newCachedFoods = cachedFoodsYesterday.filter(f => !existingIds.has(f._id));
        if (newCachedFoods.length > 0) {
          console.log(`📦 Adding ${newCachedFoods.length} cached foods for yesterday`);
          allFoods.push(...newCachedFoods);
        }
      }
      
      // Add yesterday's foods last (lowest priority)
      // IMPORTANT: If today has no data, we should still check yesterday for newly added food
      // The server might store food under yesterday's date due to timezone differences
      if (yesterdayData.foods && yesterdayData.foods.length > 0) {
        const validFoods = yesterdayData.foods.filter(hasValidNutrition);
        const invalidFoods = yesterdayData.foods.filter((f: any) => !hasValidNutrition(f));
        
        if (invalidFoods.length > 0) {
          console.log(`📅 Filtered out ${invalidFoods.length} invalid foods from yesterday (null nutrition values)`);
        }
        
        // Always add valid foods from yesterday if today has no data
        // This handles the case where server stored new food under yesterday's date
        if (allFoods.length === 0 && validFoods.length > 0) {
          console.log(`📅 Using ${validFoods.length} valid foods from yesterday (today has no data)`);
          allFoods.push(...validFoods);
        } else if (validFoods.length > 0) {
          // Today or tomorrow has data, so only add unique foods from yesterday
          const existingIds = new Set(allFoods.map(f => (f as any)._id));
          const newFoods = validFoods.filter(f => !existingIds.has((f as any)._id));
          if (newFoods.length > 0) {
            console.log(`📅 Adding ${newFoods.length} additional valid foods from yesterday`);
            allFoods.push(...newFoods);
          }
        }
      }
      
      // Add cached foods for tomorrow and day before (edge cases)
      if (cachedFoodsTomorrow.length > 0) {
        const existingIds = new Set(allFoods.map(f => (f as any)._id));
        const newCachedFoods = cachedFoodsTomorrow.filter(f => !existingIds.has(f._id));
        if (newCachedFoods.length > 0) {
          console.log(`📦 Adding ${newCachedFoods.length} cached foods for tomorrow`);
          allFoods.push(...newCachedFoods);
        }
      }
      if (cachedFoodsDayBefore.length > 0) {
        const existingIds = new Set(allFoods.map(f => (f as any)._id));
        const newCachedFoods = cachedFoodsDayBefore.filter(f => !existingIds.has(f._id));
        if (newCachedFoods.length > 0) {
          console.log(`📦 Adding ${newCachedFoods.length} cached foods for day before yesterday`);
          allFoods.push(...newCachedFoods);
        }
      }
      
      // Set the dashboard data with merged and filtered foods
      if (allFoods.length > 0) {
        console.log(`📅 Total valid foods after merge: ${allFoods.length}`);
        setDashboardData({ foods: allFoods });
      } else {
        console.log('📅 No valid foods found, using empty state');
        setDashboardData({ foods: [] });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Dashboard screen focused, refreshing data...');
      fetchDashboardData();
    }, [])
  );

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

      console.log('Calculated new totals:', newTotals);
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

  if (userLoading || loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (userError) {
    console.error('User data error:', userError);
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error loading user data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00B4D8', '#0077B6', '#023E8A']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => router.push('/(screens)/profile')}
          >
            <MaterialCommunityIcons name="account" size={28} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => router.push('/(screens)/settings')}
          >
            <MaterialCommunityIcons name="cog" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
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
                <Text style={styles.statLabel}>Calories Remaining</Text>
                <Text style={[
                  styles.statValue,
                  { color: (calorieGoal - totals.calories) < 0 ? '#ff6b6b' : '#ffffff' }
                ]}>
                  {(calorieGoal - totals.calories).toFixed(1)} kcal
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Goal</Text>
                <Text style={styles.statValue}>{calorieGoal.toFixed(1)} kcal</Text>
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

export default function Dashboard() {
  return (
    <ApolloProvider client={client}>
      <DashboardContent />
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  headerIcon: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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