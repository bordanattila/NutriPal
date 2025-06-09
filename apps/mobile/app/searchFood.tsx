import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ky from 'ky';
import { mobileAuthService as Auth } from "@/utils/authServiceMobile";
import SearchBar from '@/components/SearchBar';

interface Food {
  food_id: string;
  food_name: string;
  brand_name?: string;
  food_description?: string;
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  number_of_servings: number;
  serving_size: string;
}

interface SearchResponse {
  foods: Food[];
}

interface RecentFoodsResponse extends Array<Food> {}

const api = ky.create({
  prefixUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.13:4000',
});

export default function SearchFood() {
  const router = useRouter();
  const [foodName, setFoodName] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [logHistory, setLogHistory] = useState<Food[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [barcodeID, setBarcodeID] = useState('');

  const handleSearch = async () => {
    if (foodName === '') {
      setError('Please enter a food name');
      return;
    }

    try {
      const response = await api.get(`api/search/${foodName}`).json<SearchResponse>();
      setSearchResults(response.foods || []);
      setError(null);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search for food');
    }
  };

  const fetchLogHistory = async () => {
    try {
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

      const response = await api.get(`api/recent-foods/${userId}`).json<RecentFoodsResponse>();
      setLogHistory(response);
    } catch (error) {
      console.error('Error fetching recent foods:', error);
    }
  };

  useEffect(() => {
    fetchLogHistory();
  }, []);

  const clearSearch = () => {
    setFoodName('');
    setSearchResults([]);
    setError(null);
  };

  const renderFoodItem = (food: Food) => (
    <TouchableOpacity
      key={food.food_id}
      style={styles.foodItem}
      onPress={() => router.push(`/foodDetails/${food.food_id}`)}
    >
      <Text style={styles.foodName}>
        {food.food_name}
        {food.brand_name && <Text style={styles.brandName}> ({food.brand_name})</Text>}
      </Text>
      {food.food_description && (
        <Text style={styles.description}>{food.food_description}</Text>
      )}
      {logHistory.includes(food) && (
        <Text style={styles.nutritionInfo}>
          Calories: {food.calories.toFixed(1)} | Carb: {food.carbohydrate.toFixed(1)} | 
          Protein: {food.protein.toFixed(1)} | Fat: {food.fat.toFixed(1)} | 
          Servings: {food.number_of_servings} | Size: {food.serving_size}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00b4d8', '#0077b6', '#023e8a']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <SearchBar
            nameOfFood={foodName}
            setNameOfFood={setFoodName}
            handleSearch={handleSearch}
            clearSearch={clearSearch}
            error={error}
          />

          {searchResults.length > 0 ? (
            <View style={styles.resultsContainer}>
              {searchResults.map(renderFoodItem)}
            </View>
          ) : (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Recent History</Text>
              {logHistory.map(renderFoodItem)}
            </View>
          )}

          <Image
            source={{ uri: 'https://platform.fatsecret.com/api/static/images/powered_by_fatsecret.png' }}
            style={styles.logo}
            resizeMode="contain"
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
  },
  resultsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  historyContainer: {
    gap: 12,
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    paddingBottom: 8,
  },
  foodItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  nutritionInfo: {
    fontSize: 12,
    color: '#444',
  },
  logo: {
    width: 130,
    height: 30,
    alignSelf: 'center',
    marginVertical: 20,
  },
}); 