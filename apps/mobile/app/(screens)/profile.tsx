import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TextInput as RNTextInput } from 'react-native';
import { Text, TextInput, Button, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { mobileAuthService as Auth } from '@/utils/authServiceMobile';
import { useMutation, useQuery, ApolloProvider } from '@apollo/client';
import { GET_USER, UPDATE_USER_PROFILE } from '@/utils/mutations';
import { client } from '@/utils/apollo';
import { useRouter } from 'expo-router';
import Footer from '@/components/Footer';

function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [calorieGoal, setCalorieGoal] = useState('');
  const [password, setPassword] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { data, loading: queryLoading, error: queryError } = useQuery(GET_USER, {
    onError: (error) => {
      console.error('GraphQL query error:', error);
    }
  });
  const [updateUserProfile, { loading: mutationLoading }] = useMutation(UPDATE_USER_PROFILE, {
    onError: (error) => {
      console.error('GraphQL mutation error:', error);
    }
  });

  useEffect(() => {
    if (data?.user) {
      setProfile(data.user);
      setUsername(data.user.username || '');
      setEmail(data.user.email || '');
      setCalorieGoal(data.user.calorieGoal?.toString() || '');
      setProtein(data.user.macros?.protein?.toString() || '');
      setFat(data.user.macros?.fat?.toString() || '');
      setCarbs(data.user.macros?.carbs?.toString() || '');
    }
  }, [data]);

  const handleSave = async () => {
    try {
      const variables: any = { userId: data.user._id };
      if (username) variables.username = username;
      if (email) variables.email = email;
      if (calorieGoal) variables.calorieGoal = parseInt(calorieGoal);
      if (password) variables.password = password;
      if (protein || fat || carbs) {
        variables.macros = {
          ...(protein && { protein: parseInt(protein) }),
          ...(fat && { fat: parseInt(fat) }),
          ...(carbs && { carbs: parseInt(carbs) }),
        };
      }

      const { data: result } = await updateUserProfile({ variables });
      setProfile(result.updateUserProfile);
      showSnackbar('Profile updated successfully');
    } catch (err) {
      console.error(err);
      showSnackbar('Failed to update profile');
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  if (queryLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (queryError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error loading profile: {queryError.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#00B4D8', '#0077B6', '#023E8A']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <Text style={styles.title}>Profile</Text>

            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              style={styles.input}
              placeholder="Username"
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              mode="outlined"
              style={styles.input}
              placeholder="Email"
            />

            <TextInput
              label="New Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              placeholder="New Password"
            />

            <TextInput
              label="Daily Calorie Goal"
              value={calorieGoal}
              onChangeText={setCalorieGoal}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              placeholder="Calorie Goal"
            />

            <TextInput
              label="Protein (g)"
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              placeholder="Protein"
            />

            <TextInput
              label="Fat (g)"
              value={fat}
              onChangeText={setFat}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              placeholder="Fat"
            />

            <TextInput
              label="Carbs (g)"
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              placeholder="Carbs"
            />

            <Button
              mode="contained"
              onPress={handleSave}
              loading={mutationLoading}
              disabled={mutationLoading}
              style={styles.button}
            >
              Update Profile
            </Button>

            <Snackbar
              visible={snackbarVisible}
              onDismiss={() => setSnackbarVisible(false)}
              duration={3000}
              style={styles.snackbar}
            >
              {snackbarMessage}
            </Snackbar>
          </ScrollView>

          <Footer />
        </SafeAreaView>
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
    paddingHorizontal: 16,
  },
  scrollViewContent: {
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#ffffff',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 16,
    borderRadius: 9999,
    paddingVertical: 8,
  },
  snackbar: {
    backgroundColor: '#10b981',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff0000',
  },
});

export default function ProfileScreenWrapper() {
  return (
    <ApolloProvider client={client}>
      <ProfileScreen />
    </ApolloProvider>
  );
}
