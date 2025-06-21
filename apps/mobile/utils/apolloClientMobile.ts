// apps/mobile/app/utils/apolloClientMobile.ts

// The shared apolloClient.js already does:
//    createHttpLink({ uri: process.env.REACT_APP_API_URL + '/graphql' })
//    and sets context from localStorage.
// We need a small tweak: mobile must pull token from SecureStore.
//
// If your shared apolloClient uses localStorage directly, you can override it:
import { setContext } from '@apollo/client/link/context';
import { createHttpLink, InMemoryCache, ApolloClient } from '@apollo/client';
import * as SecureStore from 'expo-secure-store';

const mobileHttpLink = createHttpLink({
  uri: (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.14:4000') + '/graphql',
});

const mobileAuthLink = setContext(async (_, { headers }) => {
  const token = await SecureStore.getItemAsync('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const mobileClient = new ApolloClient({
  link: mobileAuthLink.concat(mobileHttpLink),
  cache: new InMemoryCache(),
});
