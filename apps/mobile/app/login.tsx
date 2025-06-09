import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '@/components/Footer';
import * as SecureStore from 'expo-secure-store';
import { mobileAuthService as Auth } from "@/utils/authServiceMobile";
import ky from 'ky';

interface LoginResponse {
  token?: string;
  refreshToken?: string;
  message?: string;
}

const api = ky.create({
  prefixUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.13:4000',
});

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refreshTokenIfNeeded = async () => {
      const loggedIn = await Auth.loggedIn();
      const token = await Auth.getToken();
      if (loggedIn) {
        const refreshSuccess = await Auth.refreshToken();
        if (!refreshSuccess) {
          await Auth.logout();
        }
      }
    };
    refreshTokenIfNeeded();
  }, []);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      console.log('Attempting login with API URL:', process.env.EXPO_PUBLIC_API_URL);
      console.log('Login credentials:', { username }); // Only log username for security
      
      const response = await api.post('user/login', {
        json: { username, password },
      });

      console.log('API Response Status:', response.status);
      
      const data: LoginResponse = await response.json();
      console.log('API Response Data:', data);
      
      if (data?.token) {
        const loginSuccess = await Auth.login(data.token);
        if (loginSuccess) {
          if (data?.refreshToken) {
            await SecureStore.setItemAsync('refreshToken', data.refreshToken);
          }
          router.replace('/(tabs)/dashboard');
        } else {
          setError('Failed to complete login process');
        }
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      if (err instanceof Error) {
        setError(`Login failed: ${err.message}`);
      } else {
        setError('Login failed. Please check your network connection.');
      }
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
        <Text style={styles.title}>Login</Text>
        
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
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          keyboardType="default"
        />

        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.signupText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
      <Footer />
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
  loginButton: {
    backgroundColor: '#00ff9d',
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
  signupLink: {
    marginTop: 20,
  },
  signupText: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
});
