// apps/mobile/app/utils/authServiceMobile.ts

import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode'; // same jwt‐decode you used on Web

/**
 * MobileAuthService
 * -----------------
 * A lightweight adaptation of your existing web AuthService (shared/utils/auth.js),
 * but replaced localStorage → SecureStore and window.location → Expo Router.
 */
class MobileAuthService {
  /**
   * Get decoded user profile from token.
   */
  getProfile = async (): Promise<any | null> => {
    try {
      const token = await SecureStore.getItemAsync('id_token');
      console.log('Retrieved token from SecureStore:', !!token);
      if (!token) {
        console.log('No token found in SecureStore');
        return null;
      }
      
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded);
        return decoded;
      } catch (err) {
        console.error('Error decoding token:', err);
        return null;
      }
    } catch (err) {
      console.error('Error in getProfile:', err);
      return null;
    }
  };

  /**
   * Check if the user is currently logged in.
   */
 loggedIn = async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync('id_token');
    if (!token) return false;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  /**
   * Determine if token is expired.
   */
  private isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      // decoded.exp is in seconds, Date.now() is milliseconds:
      return decoded.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }

  /**
   * Retrieve JWT from SecureStore.
   */
  public async getToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync('id_token');
      console.log('Retrieved token from SecureStore:', !!token);
      return token;
    } catch (err) {
      console.error('Error getting token:', err);
      return null;
    }
  }

  /**
   * Save JWT to SecureStore and navigate to dashboard.
   */
login = async (idToken: string, refreshToken?: string) => {
    await SecureStore.setItemAsync('id_token', idToken);
    if (refreshToken) {
      await SecureStore.setItemAsync('refreshToken', refreshToken);
    }
    return true;
  };

  /**
   * Attempt to refresh token using stored refresh token.
   */
  public async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!refreshToken) return false;

      // Call your existing /api/refresh endpoint via ky (you can re‐use shared/apiAuth.js if you modify it for mobile)
      // Or use Apollo if you have a GraphQL mutation for refresh.
      // For example (assuming you have a REST endpoint):
      // const newToken = await fetchNewToken(refreshToken);
      // await SecureStore.setItemAsync('id_token', newToken);
      // return true;

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Clear tokens and navigate to login.
   */
  logout = async () => {
    await SecureStore.deleteItemAsync('id_token');
    await SecureStore.deleteItemAsync('refreshToken');
  };


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
