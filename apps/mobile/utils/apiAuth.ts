import ky from 'ky';
import * as SecureStore from 'expo-secure-store';
import base64 from 'react-native-base64';

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

let accessToken: string | null = null;
let tokenExpiration: number | null = null;

const getAccessToken = async (): Promise<string | null> => {
  const tokenUrl = 'https://oauth.fatsecret.com/connect/token';
  const clientId = process.env.EXPO_PUBLIC_CLIENT_ID;
  const clientSecret = process.env.EXPO_PUBLIC_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing client credentials');
    return null;
  }

  const data = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'basic'
  }).toString();

  try {
    const credentials = `${clientId}:${clientSecret}`;
    const encodedCredentials = base64.encode(credentials);

    const response = await ky.post(tokenUrl, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${encodedCredentials}`
      },
      body: data
    }).json<TokenResponse>();

    accessToken = response.access_token;
    tokenExpiration = Date.now() + response.expires_in * 1000;

    // Store token and expiration in SecureStore
    await SecureStore.setItemAsync('fatSecretToken', accessToken);
    await SecureStore.setItemAsync('fatSecretTokenExpiration', tokenExpiration.toString());

    console.log('Access token fetched successfully.');
    return accessToken;
  } catch (error) {
    console.error('Error fetching access token:', error);
    return null;
  }
};

const getAccessTokenValue = async (): Promise<string | null> => {
  // Try to get stored token and expiration
  if (!accessToken || !tokenExpiration) {
    const storedToken = await SecureStore.getItemAsync('fatSecretToken');
    const storedExpiration = await SecureStore.getItemAsync('fatSecretTokenExpiration');
    
    if (storedToken && storedExpiration) {
      accessToken = storedToken;
      tokenExpiration = parseInt(storedExpiration);
    }
  }

  if (!accessToken || !tokenExpiration || Date.now() >= tokenExpiration) {
    console.log('Access token expired or missing, fetching a new one...');
    return await getAccessToken();
  }

  return accessToken;
};

export { getAccessToken, getAccessTokenValue }; 