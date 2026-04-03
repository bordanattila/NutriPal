import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DateTime } from 'luxon';
import { JwtPayload } from 'jwt-decode';
import { useQuery } from '@apollo/client';
import { GET_USER } from '@/utils/mutations';
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
  waterCups: number;
}

interface CustomJwtPayload extends JwtPayload {
  data?: {
    _id?: string;
    id?: string;
  };
}

interface ApiResponse {
  foods?: FoodLog[];
  waterCups?: number;
  message?: string;
}

const api = ky.create({
  prefixUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.14:4000',
});

function DashboardContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({ foods: [], waterCups: 0 });
  const [waterIntakeOz, setWaterIntakeOz] = useState(0);
  
  // Get user data including calorie goal
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USER, {
    onError: (error) => {
      console.error('Error fetching user data:', error);
      if (error.message.includes('Unauthorized')) {
        router.replace('/login');
      }
    }
  });
  
  const OUNCES_PER_CUP = 8;
  const PROGRESS_SEGMENTS = 12;

  const calorieGoal = userData?.user?.calorieGoal || 2000;
  const waterUnit: string = userData?.user?.waterUnit || 'cups';

  const waterGoalOz: number =
    userData?.user?.waterGoalOz ??
    ((userData?.user?.waterGoal ?? 12) * OUNCES_PER_CUP);

  const ozToDisplay = (oz: number) => {
    const value = waterUnit === 'oz' ? oz : oz / OUNCES_PER_CUP;
    return Number.isInteger(value) ? value : Number(value.toFixed(1));
  };
  const getUnitLabel = (value: number) => waterUnit === 'oz' ? 'oz' : (value === 1 ? 'cup' : 'cups');

  const waterStepOz = waterUnit === 'oz' ? 1 : OUNCES_PER_CUP;
  
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
      
      // Calculate dates using America/New_York timezone to match server
      // Server uses NY timezone for all date calculations
      const now = DateTime.now().setZone('America/New_York');
      const today = now.toFormat('yyyy-MM-dd');
      
      // Query today's food - no need to check multiple dates since server bug is fixed
      const todayData = await queryDate(today).catch(() => ({ message: "No food has been logged for this day." }));
      
      // Log query result for debugging
      const hasFoods = 'foods' in todayData && todayData.foods;
      console.log('📅 Today query result:', !hasFoods ? 'No data' : `${todayData.foods?.length || 0} foods`);
      
      // Collect all foods from today
      // Filter out foods with null nutrition values (they won't contribute to totals anyway)
      const allFoods: FoodLog[] = [];
      
      // Helper to filter foods with valid nutrition data
      const hasValidNutrition = (food: any): boolean => {
        return food.calories !== null && food.calories !== undefined &&
               (food.carbohydrate !== null || food.protein !== null || food.fat !== null);
      };
      
      // Get cached foods for today (recently added foods that might not be in query results yet)
      const cachedFoodsToday = getCachedFoods(today);
      
      if (cachedFoodsToday.length > 0) {
        console.log(`📦 Found ${cachedFoodsToday.length} cached foods for today (${today})`);
        console.log('📦 Cached food dates:', cachedFoodsToday.map(f => f.dateStored));
      } else {
        console.log(`📦 No cached foods found for today (${today})`);
      }
      
      // Add today's foods
      if (hasFoods && todayData.foods && todayData.foods.length > 0) {
        const validFoods = todayData.foods.filter(hasValidNutrition);
        console.log(`📅 Adding ${validFoods.length} valid foods from today (${todayData.foods.length} total)`);
        allFoods.push(...validFoods);
      }
      
      // Add cached foods for today (recently added, might not be in query yet)
      if (cachedFoodsToday.length > 0) {
        const existingIds = new Set(allFoods.map(f => (f as any)._id));
        const newCachedFoods = cachedFoodsToday
          .filter(f => !existingIds.has(f._id))
          .map(f => ({
            ...f,
            fiber: f.fiber ?? 0,
            sodium: f.sodium ?? 0,
            saturated_fat: f.saturated_fat ?? 0
          })) as FoodLog[];
        if (newCachedFoods.length > 0) {
          console.log(`📦 Adding ${newCachedFoods.length} cached foods for today`);
          allFoods.push(...newCachedFoods);
        }
      }
      
      const serverWater = ('waterCups' in todayData) ? (todayData.waterCups ?? 0) : 0;

      if (allFoods.length > 0) {
        console.log(`📅 Total valid foods after merge: ${allFoods.length}`);
        setDashboardData({ foods: allFoods, waterCups: serverWater });
      } else {
        console.log('📅 No valid foods found, using empty state');
        setDashboardData({ foods: [], waterCups: serverWater });
      }
      setWaterIntakeOz(serverWater * OUNCES_PER_CUP);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const saveWaterIntake = useCallback(async (nextOz: number, prevOz: number) => {
    try {
      const token = await Auth.getToken();
      const profile = await Auth.getProfile() as CustomJwtPayload;
      const userId = profile?.data?._id || profile?.data?.id;
      if (!token || !userId) return;
      const todaysDate = DateTime.now().setZone('America/New_York').toFormat('yyyy-MM-dd');
      await api.put('api/water-intake', {
        json: { user_id: userId, date: todaysDate, waterCups: nextOz / OUNCES_PER_CUP },
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error saving water intake:', error);
      setWaterIntakeOz(prevOz);
      Alert.alert('Error', 'Failed to save water intake.');
    }
  }, []);

  const adjustWater = (direction: number) => {
    const prevOz = waterIntakeOz;
    const deltaOz = direction * waterStepOz;
    const nextOz = Math.max(0, prevOz + deltaOz);
    if (nextOz === prevOz) return;
    setWaterIntakeOz(nextOz);
    saveWaterIntake(nextOz, prevOz);
    if (prevOz < waterGoalOz && nextOz >= waterGoalOz) {
      const dGoal = ozToDisplay(waterGoalOz);
      Alert.alert('Goal reached!', `You hit your ${dGoal} ${getUnitLabel(dGoal)} water goal!`);
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

          {/* Water Intake */}
          <View style={styles.waterSection}>
            <Text style={styles.waterTitle}>Water Intake</Text>
            <View style={styles.waterControls}>
              <TouchableOpacity
                onPress={() => adjustWater(-1)}
                disabled={waterIntakeOz <= 0}
                style={[styles.waterButton, waterIntakeOz <= 0 && styles.waterButtonDisabled]}
              >
                <Text style={styles.waterButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.waterCount}>
                {ozToDisplay(waterIntakeOz)} {getUnitLabel(ozToDisplay(waterIntakeOz))}
              </Text>
              <TouchableOpacity
                onPress={() => adjustWater(1)}
                style={[styles.waterButton]}
              >
                <Text style={styles.waterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.waterBar}>
              {Array.from({ length: PROGRESS_SEGMENTS }, (_, i) => {
                const ratio = waterGoalOz > 0 ? Math.min(waterIntakeOz / waterGoalOz, 1) : 0;
                const filled = Math.round(ratio * PROGRESS_SEGMENTS);
                return (
                  <View
                    key={i}
                    style={[styles.waterSegment, i < filled ? styles.waterSegmentFilled : styles.waterSegmentEmpty]}
                  />
                );
              })}
            </View>
            <Text style={styles.waterLabel}>
              {ozToDisplay(waterIntakeOz)} / {ozToDisplay(waterGoalOz)} {getUnitLabel(ozToDisplay(waterIntakeOz))}
            </Text>
          </View>
        </ScrollView>
        <Footer />
      </LinearGradient>
    </View>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
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
  waterSection: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  waterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 14,
  },
  waterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterButtonDisabled: {
    opacity: 0.35,
  },
  waterButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  waterCount: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '600',
    minWidth: 120,
    textAlign: 'center',
  },
  waterBar: {
    flexDirection: 'row',
    gap: 3,
    width: '100%',
    marginBottom: 6,
  },
  waterSegment: {
    flex: 1,
    height: 10,
    borderRadius: 3,
  },
  waterSegmentFilled: {
    backgroundColor: '#5eead4',
  },
  waterSegmentEmpty: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  waterLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
}); 