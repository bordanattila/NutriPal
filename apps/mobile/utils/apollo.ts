import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import Constants from 'expo-constants';
import { mobileAuthService } from './authServiceMobile';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

console.log('Initializing Apollo Client with API URL:', API_URL);

const httpLink = createHttpLink({
  uri: `${API_URL}/graphql`,
});

// Add logging link
const loggingLink = new ApolloLink((operation, forward) => {
  console.log(`Starting request for ${operation.operationName}`);
  
  return forward(operation).map((response) => {
    console.log(`Received response for ${operation.operationName}:`, response);
    return response;
  });
});

// Add error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Operation: ${operation.operationName}`
      );
    });
  }
  if (networkError) {
    console.error(`[Network error for ${operation.operationName}]:`, networkError);
  }
});

const authLink = setContext(async (_, { headers }) => {
  const token = await mobileAuthService.getToken();
  console.log('Auth token available:', !!token);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: errorLink.concat(loggingLink).concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
}); 