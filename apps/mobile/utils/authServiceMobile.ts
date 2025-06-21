// apps/mobile/app/utils/authServiceMobile.ts

import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import ky from 'ky';

interface TokenResponse {
  token?: string;
  refreshToken?: string;
  message?: string;
}

const api = ky.create({
  prefixUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.14:4000',
});

/**
 * MobileAuthService
 * -----------------
 * A lightweight adaptation of your existing web AuthService (shared/utils/auth.js),
 * but replaced localStorage → SecureStore and window.location → Expo Router.
 */
class MobileAuthService {
  private token: string | null = null;

  /**
   * Get decoded user profile from token.
   */
  async getProfile() {
    try {
      const token = await this.getToken();
      console.log('getProfile - token exists:', !!token);
      if (!token) return null;
      const decoded = jwtDecode(token);
      console.log('getProfile - decoded token:', decoded);
      return decoded;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  /**
   * Check if the user is currently logged in.
   */
  async loggedIn() {
    try {
      const token = await this.getToken();
      console.log('loggedIn - token exists:', !!token);
      if (!token) return false;
      const isExpired = await this.isTokenExpired(token);
      console.log('loggedIn - token expired:', isExpired);
      return !isExpired;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  /**
   * Determine if token is expired.
   */
  async isTokenExpired(token: string) {
    try {
      const decoded: any = jwtDecode(token);
      console.log('isTokenExpired - token exp:', decoded.exp, 'current time:', Date.now() / 1000);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Retrieve JWT from SecureStore.
   */
  async getToken() {
    try {
      if (this.token) {
        return this.token;
      }
      
      const token = await SecureStore.getItemAsync('userToken');
      console.log('Retrieved token from SecureStore:', !!token);
      
      if (token) {
        const isExpired = await this.isTokenExpired(token);
        if (!isExpired) {
          this.token = token;
          return token;
        } else {
          console.log('Token is expired, clearing stored tokens');
          // Clear expired tokens
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('refreshToken');
          this.token = null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Save JWT to SecureStore and navigate to dashboard.
   */
  async login(token: string) {
    try {
      await SecureStore.setItemAsync('userToken', token);
      this.token = token;
      console.log('Token stored in auth service:', !!this.token);
      return true;
    } catch (error) {
      console.error('Error storing token:', error);
      return false;
    }
  }

  /**
   * Clear tokens and navigate to login.
   */
  async logout() {
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('refreshToken');
      this.token = null;
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  }

  /**
   * Decode a JWT token safely.
   */
  private decodeToken(token: string): any | null {
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }
}

export const mobileAuthService = new MobileAuthService();
