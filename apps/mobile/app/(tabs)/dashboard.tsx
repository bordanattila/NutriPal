import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { mobileAuthService as Auth } from "@/utils/authServiceMobile";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ky from 'ky';
import { DateTime } from 'luxon';
import Footer from '@/components/Footer';
import DonutChart from '@/components/DonutChart';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GET_USER } from '@/utils/mutations';
import { JwtPayload } from 'jwt-decode';

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

const api = ky.create({
  prefixUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.13:4000',
});

// Create the http link
const httpLink = createHttpLink({
  uri: `${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.13:4000'}/graphql`,
});

// Create the auth link
const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await Auth.getToken();
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      }
    };
  } catch (error) {
    console.error('Error getting auth token:', error);
    return {
      headers: {
        ...headers,
      }
    };
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
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

      // Extract userId from JWT payload - profile is the decoded token
      const userId = profile.data?._id || profile.data?.id;
      console.log('Extracted userId:', userId);
      
      if (!userId) {
        console.log('No userId found in profile, redirecting to login');
        router.replace('/login');
        return;
      }

      // Force current date to be actual current date, not from token
      const currentDate = new Date();
      const today = DateTime.fromJSDate(currentDate)
        .setZone('America/New_York')
        .toFormat('yyyy-MM-dd');
      
      const response = await api.get(`api/foodByDate/${userId}/date/${today}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: any = await response.json();
      
      if (data.message === "No food has been logged for this day.") {
        console.log('No food logged for today, setting empty foods array');
        setDashboardData({ foods: [] });
      } else {
        setDashboardData({ foods: data.foods || [] });
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
        colors={['#00b4d8', '#0077b6', '#023e8a']}
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