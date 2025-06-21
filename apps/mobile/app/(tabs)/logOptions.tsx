import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LogOptions() {
  const router = useRouter();

  const options = [
    {
      title: 'Search Food',
      icon: 'magnify' as const,
      onPress: () => router.push('/searchFood'),
    },
    {
      title: 'Log From Recipe',
      icon: 'book-open-page-variant' as const,
      onPress: () => router.push('/logFromRecipe'),
    },
    {
      title: 'Log from Meal',
      icon: 'food-variant' as const,
      onPress: () => router.push('/logFromMeal'),
    },
    {
      title: 'AI Assistant',
      icon: 'robot' as const,
      onPress: () => router.push('/aiAssistant'),
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00b4d8', '#0077b6', '#023e8a']}
        style={styles.gradient}
      >
          
          <View style={styles.tilesContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.title}
                style={styles.tile}
                onPress={option.onPress}
              >
                <MaterialCommunityIcons
                  name={option.icon}
                  size={32}
                  color="#00b4d8"
                />
                <Text style={styles.tileText}>{option.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
  
        <View style={styles.content}>
          <Image
            source={{ uri: 'https://platform.fatsecret.com/api/static/images/powered_by_fatsecret.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
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
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  logo: {
    width: 130,
    height: 30,
    marginBottom: 40,
    marginTop: 20,
  },
  tilesContainer: {
    width: '100%',
    gap: 16,
    padding: 16,
    paddingTop: 50,
  },
  tile: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    flexDirection: 'row',
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
  tileText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
  },
}); 