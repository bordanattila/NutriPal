import Constants from 'expo-constants';

/**
 * Get the API URL from config or environment variables
 * This ensures consistent API URL usage across the app
 */
export const getApiUrl = (): string => {
  const apiUrl = 
    Constants.expoConfig?.extra?.api?.url || 
    process.env.EXPO_PUBLIC_API_URL || 
    'http://192.168.1.14:4000';
  
  return apiUrl;
};

