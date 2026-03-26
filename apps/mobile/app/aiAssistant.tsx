import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, ApolloProvider } from '@apollo/client';
import { GET_USER } from '@/utils/mutations';
import { client } from '@/utils/apollo';
import { mobileAuthService } from '@/utils/authServiceMobile';
import { DateTime } from 'luxon';
import ky from 'ky';

/**
 * @constant api
 * @description Preconfigured ky instance for making API requests with a set prefix URL.
 */
const api = ky.create({
  prefixUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.14:4000',
});

interface RemainingMacros {
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodLogResponse {
  foods: Array<{
    protein: number;
    carbohydrate: number;
    fat: number;
  }>;
}

interface AiResponse {
  reply: string;
}

const AiAssistant = () => {
  const router = useRouter();
  const [userMessage, setUserMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingMacros, setRemainingMacros] = useState<RemainingMacros | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Get auth token
  useEffect(() => {
    const getToken = async () => {
      const token = await mobileAuthService.getToken();
      setAuthToken(token);
    };
    getToken();
  }, []);

  const { data, loading: userLoading, error: userError } = useQuery(GET_USER, {
    context: {
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : '',
      },
    },
    skip: !authToken,
  });

  const userId = data?.user?._id;
  const macroGoals = data?.user?.macros;

  console.log('User data from GraphQL:', data);
  console.log('Macro goals:', macroGoals);

  useEffect(() => {
    const fetchTodaysLog = async () => {
      // Only require userId and authToken - macroGoals can be null (we'll use defaults)
      if (!userId || !authToken) {
        console.log('Missing userId or authToken, skipping macro calculation');
        return;
      }

      // Query today's date using America/New_York timezone to match server
      const now = DateTime.now().setZone('America/New_York');
      const today = now.toFormat('yyyy-MM-dd');
      
      try {
        // Query today's food
        const todayRes = await api.get(`api/foodByDate/${userId}/date/${today}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        }).catch(() => ({ json: async () => ({ foods: [] }) }));

        const todayData = await todayRes.json();

        // Get cached foods for today (recently added foods that might not be in query results yet)
        const { getCachedFoods } = require('@/utils/foodCache');
        const cachedFoodsToday = getCachedFoods(today);

        // Collect all foods from today
        const allFoods: any[] = [];
        
        // Helper to filter foods with valid nutrition data
        const hasValidNutrition = (food: any): boolean => {
          return food.calories !== null && food.calories !== undefined &&
                 (food.carbohydrate !== null || food.protein !== null || food.fat !== null);
        };

        // Add foods from today
        if (todayData.foods) {
          allFoods.push(...todayData.foods.filter(hasValidNutrition));
        }

        // Add cached foods for today
          const existingIds = new Set(allFoods.map(f => f._id));
        cachedFoodsToday.forEach((cachedFood: any) => {
            if (!existingIds.has(cachedFood._id)) {
              allFoods.push(cachedFood);
            }
        });

        const totals = {
          protein: 0,
          carbs: 0,
          fat: 0,
        };

        allFoods.forEach((item: any) => {
          totals.protein += item.protein || 0;
          totals.carbs += item.carbohydrate || 0;
          totals.fat += item.fat || 0;
        });

        console.log('Macro goals from GraphQL:', macroGoals);
        console.log('Food totals:', totals);

        // Use default macros if not set
        const defaultMacros = {
          protein: 150,
          carbs: 200,
          fat: 65
        };

        // Use macroGoals if available, otherwise use defaults
        const effectiveMacros = macroGoals && (macroGoals.protein || macroGoals.carbs || macroGoals.fat) 
          ? macroGoals 
          : defaultMacros;

        console.log('Effective macros (goals):', effectiveMacros);
        console.log('Calculated remaining macros:', {
          protein: Math.max(effectiveMacros.protein - totals.protein, 0),
          carbs: Math.max(effectiveMacros.carbs - totals.carbs, 0),
          fat: Math.max(effectiveMacros.fat - totals.fat, 0),
        });

        setRemainingMacros({
          protein: Math.max((effectiveMacros.protein || 0) - totals.protein, 0),
          carbs: Math.max((effectiveMacros.carbs || 0) - totals.carbs, 0),
          fat: Math.max((effectiveMacros.fat || 0) - totals.fat, 0),
        });
      } catch (err) {
        console.error('Failed to fetch food log:', err);
        // Set remaining macros to defaults even on error, so UI can still show something
        setRemainingMacros({
          protein: 150,
          carbs: 200,
          fat: 65,
        });
      }
    };

    fetchTodaysLog();
  }, [userId, macroGoals, authToken]);

  // Handle authentication errors
  useEffect(() => {
    if (userError) {
      console.error('Authentication error:', userError);
      Alert.alert(
        'Authentication Error',
        'Please log in again to use the AI Assistant.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/login'),
          }
        ]
      );
    }
  }, [userError, router]);

  const handleSubmit = async () => {
    if (!userMessage.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (!authToken) {
      Alert.alert('Error', 'Please log in to use the AI Assistant');
      return;
    }

    setLoading(true);

    try {
      console.log("Sending macros:", remainingMacros);
      console.log("macroGoals from user:", macroGoals);
      
      const response = await api.post('api/ai-assist', {
        json: {
          message: userMessage,
          macros: remainingMacros,
        },
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        timeout: 30000, // 30 second timeout for AI response
      });

      const data = await response.json() as AiResponse;
      setAiResponse(data.reply);
      setUserMessage('');
    } catch (err: any) {
      console.error('Error calling AI endpoint:', err);
      let errorMessage = 'Sorry, something went wrong.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Please log in again to use the AI Assistant.';
        // Redirect to login
        router.push('/login');
      } else if (err.name === 'TimeoutError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.message?.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setAiResponse(errorMessage);
    }

    setLoading(false);
  };

  // Show loading state while getting auth token
  if (!authToken) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "AI Assistant" }} />
        <LinearGradient
          colors={['#00b4d8', '#0077b6', '#023e8a']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Please log in to use the AI Assistant</Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginButtonText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "AI Assistant",
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <LinearGradient
        colors={['#00b4d8', '#0077b6', '#023e8a']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Ask NutriPal AI</Text>
            <TextInput
              style={styles.textInput}
              value={userMessage}
              onChangeText={setUserMessage}
              placeholder="What should I eat for lunch to reach my protein goal?"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Thinking...' : 'Ask AI'}
              </Text>
            </TouchableOpacity>
          </View>

          {aiResponse && (
            <View style={styles.responseContainer}>
              <Text style={styles.responseTitle}>AI Response</Text>
              <Text style={styles.responseText}>{aiResponse}</Text>
            </View>
          )}

          {remainingMacros && (
            <View style={styles.macrosContainer}>
              <Text style={styles.macrosTitle}>Remaining Macros Today</Text>
              <View style={styles.macrosRow}>
                <Text style={styles.macroText}>Protein: {remainingMacros.protein.toFixed(1)}g</Text>
                <Text style={styles.macroText}>Carbs: {remainingMacros.carbs.toFixed(1)}g</Text>
                <Text style={styles.macroText}>Fat: {remainingMacros.fat.toFixed(1)}g</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default function AiAssistantWrapper() {
  return (
    <ApolloProvider client={client}>
      <AiAssistant />
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: '#10b981',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  responseContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  responseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f766e',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  responseText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  macrosContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  macrosTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 8,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  backButton: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  loginButton: {
    backgroundColor: '#10b981',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 