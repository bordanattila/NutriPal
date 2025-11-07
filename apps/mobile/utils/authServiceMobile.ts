// apps/mobile/app/utils/authServiceMobile.ts

import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import ky from 'ky';
import { getApiUrl } from './apiConfig';

interface TokenResponse {
  token?: string;
  refreshToken?: string;
  message?: string;
}

const api = ky.create({
  prefixUrl: getApiUrl(),
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
   * Automatically refreshes the token if it's expired and a refresh token is available.
   */
  async getToken() {
    try {
      if (this.token) {
        const isExpired = await this.isTokenExpired(this.token);
        if (!isExpired) {
          return this.token;
        } else {
          // Token in memory is expired, clear it
          this.token = null;
        }
      }
      
      const token = await SecureStore.getItemAsync('userToken');
      console.log('Retrieved token from SecureStore:', !!token);
      
      if (token) {
        const isExpired = await this.isTokenExpired(token);
        if (!isExpired) {
          this.token = token;
          return token;
        } else {
          console.log('Token is expired, attempting to refresh...');
          // Try to refresh the token
          const refreshToken = await SecureStore.getItemAsync('refreshToken');
          if (refreshToken) {
            // Check if refresh token is also expired
            const isRefreshExpired = await this.isTokenExpired(refreshToken);
            if (isRefreshExpired) {
              console.log('Refresh token is also expired, clearing stored tokens');
              await SecureStore.deleteItemAsync('userToken');
              await SecureStore.deleteItemAsync('refreshToken');
              this.token = null;
              return null;
            }
            
            // Refresh token is still valid, try to use it
            const refreshSuccess = await this.refreshToken(refreshToken);
            if (refreshSuccess) {
              // Get the new token
              const newToken = await SecureStore.getItemAsync('userToken');
              if (newToken) {
                this.token = newToken;
                console.log('Token refreshed successfully');
                return newToken;
              }
            } else {
              console.log('Token refresh failed, clearing stored tokens');
              // Refresh failed, clear all tokens
              await SecureStore.deleteItemAsync('userToken');
              await SecureStore.deleteItemAsync('refreshToken');
              this.token = null;
            }
          } else {
            console.log('No refresh token available, clearing stored tokens');
            // No refresh token available, clear tokens
            await SecureStore.deleteItemAsync('userToken');
            this.token = null;
          }
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
   * Refresh the JWT token using a refresh token.
   */
  async refreshToken(refreshToken: string) {
    try {
      // Try the api/refresh endpoint first
      let response: TokenResponse;
      try {
        response = await api.post('api/refresh', {
          json: { token: refreshToken },
          headers: {
            'Content-Type': 'application/json',
          },
        }).json<TokenResponse>();
        
        // The server returns accessToken, not token
        if ((response as any)?.accessToken) {
          await SecureStore.setItemAsync('userToken', (response as any).accessToken);
          this.token = (response as any).accessToken;
          return true;
        }
      } catch (apiError) {
        console.log('api/refresh failed, trying user/refresh:', apiError);
        // Fallback to user/refresh endpoint
        try {
          response = await api.post('user/refresh', {
            json: { refreshToken },
            headers: {
              'Content-Type': 'application/json',
            },
          }).json<TokenResponse>();

          if (response?.token) {
            await SecureStore.setItemAsync('userToken', response.token);
            this.token = response.token;
            if (response?.refreshToken) {
              await SecureStore.setItemAsync('refreshToken', response.refreshToken);
            }
            return true;
          }
        } catch (userError) {
          console.error('Both refresh endpoints failed:', userError);
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
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
