import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import Footer from '@/components/Footer';
import { mobileAuthService as Auth } from "@/utils/authServiceMobile";
import ky from 'ky';

interface SignupResponse {
  token?: string;
  refreshToken?: string;
  message?: string;
  [key: string]: any;
}

const api = ky.create({
  prefixUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.14:4000',
});

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    // Trim the input values
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Validate inputs
    if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // Password validation (at least 6 characters)
    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      console.log('Signing up with:', { username: trimmedUsername, email: trimmedEmail });
      
      const response = await api.post('user/signup', {
        json: { 
          username: trimmedUsername, 
          email: trimmedEmail, 
          password: trimmedPassword 
        },
      });

      const data: SignupResponse = await response.json();
      console.log('Signup response:', data);

      if (data?.token) {
        // Store the token
        await SecureStore.setItemAsync('userToken', data.token);
        
        // Initialize Auth service with the token
        await Auth.login(data.token);
        
        if (data?.refreshToken) {
          await SecureStore.setItemAsync('refreshToken', data.refreshToken);
        }

        // Small delay to ensure token is stored
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify token is stored
        const storedToken = await SecureStore.getItemAsync('userToken');
        console.log('Token stored successfully:', !!storedToken);

        // Navigate to dashboard
        router.replace('/(tabs)/dashboard');
      } else {
        setError('Signup failed: ' + (data.message || 'Please try again.'));
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else if (error instanceof Response) {
        const text = await error.text();
        setError(text || 'Signup failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <LinearGradient
      colors={['#00b4d8', '#0077b6', '#023e8a']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.loadingText}>Creating your account...</Text>
      </View>
    </LinearGradient>
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
          placeholderTextColor="#666"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoComplete="username"
          keyboardType="default"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
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
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginText}>Already have an account? Login</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  loginLink: {
    marginTop: 20,
  },
  loginText: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
});
