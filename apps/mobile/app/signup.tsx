import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AppStackNavigationProp } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';

interface SignupResponse {
  token?: string;
  refreshToken?: string;
  [key: string]: any; // Allow for additional properties
}
import { mobileAuthService as Auth } from "@/utils/authServiceMobile";
import ky from 'ky';

const api = ky.create({
  prefixUrl: process.env.EXPO_PUBLIC_API_URL,
});

export default function Signup() {
  const navigation = useNavigation<AppStackNavigationProp>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    if (!username || !email || !password) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('user/signup', {
        json: { username, email, password },
      });

      const data: SignupResponse = await response.json();

      if (data?.token) {
        Auth.login(data.token);
        if (data?.refreshToken) {
          await SecureStore.setItemAsync('refreshToken', data.refreshToken);
        }
        navigation.navigate('dashboard');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Error signing up:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={styles.container}>
      <Text>Loading...</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#00b4d8', '#0077b6', '#023e8a']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Sign Up</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoComplete="username"
          keyboardType="default"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          keyboardType="default"
        />

        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Signing up...' : 'Sign up'}</Text>
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('login')}
        >
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#fff',
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signupButton: {
    backgroundColor: '#81e6f9',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#023e8a',
  },
  error: {
    color: '#ff4444',
    marginTop: 10,
    textAlign: 'center',
  },
  loginLink: {
    marginTop: 20,
  },
  loginText: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
});
