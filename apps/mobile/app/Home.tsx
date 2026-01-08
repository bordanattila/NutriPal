import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { mobileAuthService as Auth } from '@/utils/authServiceMobile';
import Footer from '@/components/Footer';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = await Auth.loggedIn();
      if (isLoggedIn) {
        router.push('/dashboard');
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  return (
    <LinearGradient
      colors={['#00b4d8', '#0077b6', '#023e8a']}
      style={styles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to NutriPal</Text>
        <Text style={styles.subtitle}>Your #1 Nutrition Companion</Text>

        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.signupText}>Not a member yet? Sign up below</Text>

        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={handleSignup}
        >
          <Text style={styles.buttonText}>Signup</Text>
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
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
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
  signupButton: {
    backgroundColor: '#81e6f9',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#023e8a',
  },
  signupText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
}); 