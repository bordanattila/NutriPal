import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, TextInput, Button, useTheme, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { mobileAuthService as Auth } from "@/utils/authServiceMobile";
import { useRouter } from 'expo-router';
import Footer from '@/components/Footer';
import { ApolloClient, InMemoryCache, ApolloProvider, useMutation, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { UPDATE_USER_PROFILE } from '@/utils/mutations';

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  calorieGoal: number;
}

// Create the http link
const httpLink = createHttpLink({
  uri: `${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.13:4000'}/graphql`,
});

// Create the auth link
const authLink = setContext(async (_, { headers }) => {
  const token = await Auth.getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

export default function ProfileScreenWrapper() {
  return (
    <ApolloProvider client={client}>
      <ProfileScreen />
    </ApolloProvider>
  );
}

function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [calorieGoal, setCalorieGoal] = useState('2000');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE, {
    onCompleted: (data) => {
      setProfile(data.updateUserProfile);
      setCalorieGoal(data.updateUserProfile.calorieGoal.toString());
      showSnackbar('Profile updated successfully');
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      showSnackbar('Failed to update profile');
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = await Auth.getProfile();
        if (userData?.data) {
          setProfile(userData.data as UserProfile);
          setCalorieGoal(userData.data.calorieGoal?.toString() || '2000');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        showSnackbar('Failed to load profile');
      }
    };

    loadProfile();
  }, []);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleSave = async () => {
    if (!profile?._id) {
      showSnackbar('Profile not loaded');
      return;
    }

    const goalValue = parseInt(calorieGoal, 10);
    if (isNaN(goalValue) || goalValue <= 0) {
      showSnackbar('Please enter a valid calorie goal');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting to update profile with:', {
        userId: profile._id,
        calorieGoal: goalValue
      });
      
      await updateUserProfile({
        variables: {
          userId: profile._id,
          calorieGoal: goalValue,
        },
      });
      
      console.log('Profile update successful');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      // Log more details about the error
      if (error?.networkError) {
        console.error('Network error:', error.networkError);
      }
      if (error?.graphQLErrors) {
        console.error('GraphQL errors:', error.graphQLErrors);
      }
      showSnackbar('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00b4d8', '#0077b6', '#023e8a']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView style={styles.scrollView}>
            <Text variant="headlineMedium" style={styles.title}>Profile</Text>

            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.field}>
                  <Text variant="labelLarge" style={styles.label}>Username</Text>
                  <Text variant="bodyLarge" style={styles.value}>{profile.username}</Text>
                </View>

                <View style={styles.field}>
                  <Text variant="labelLarge" style={styles.label}>Email</Text>
                  <Text variant="bodyLarge" style={styles.value}>{profile.email}</Text>
                </View>

                <View style={styles.field}>
                  <Text variant="labelLarge" style={styles.label}>Daily Calorie Goal</Text>
                  {isEditing ? (
                    <TextInput
                      value={calorieGoal}
                      onChangeText={setCalorieGoal}
                      keyboardType="numeric"
                      mode="outlined"
                      style={styles.input}
                      disabled={isLoading}
                    />
                  ) : (
                    <Text variant="bodyLarge" style={styles.value}>{calorieGoal} calories</Text>
                  )}
                </View>

                <Button
                  mode={isEditing ? "contained" : "outlined"}
                  onPress={() => isEditing ? handleSave() : setIsEditing(true)}
                  style={styles.button}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </Button>
              </Card.Content>
            </Card>
          </ScrollView>
        </SafeAreaView>
        <Footer />

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
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
  safeArea: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginVertical: 16,
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  card: {
    margin: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  value: {
    color: 'white',
  },
  input: {
    marginTop: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  button: {
    marginTop: 16,
  },
  snackbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
}); 