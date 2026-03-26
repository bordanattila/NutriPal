import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { mobileAuthService } from './authServiceMobile';
import { getApiUrl } from './apiConfig';

const API_URL = getApiUrl();

console.log('Final API_URL:', API_URL);
console.log('GraphQL endpoint will be:', `${API_URL}/graphql`);

if (!API_URL) {
  console.error('ERROR: API_URL is not configured. Please set EXPO_PUBLIC_API_URL environment variable.');
  throw new Error('API_URL is not configured. Please set EXPO_PUBLIC_API_URL environment variable.');
}

// Custom fetch to handle ngrok headers
const customFetch = (uri: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const headers = new Headers(init?.headers);
  
  // Add ngrok-skip-browser-warning header for ngrok free tier
  if (typeof uri === 'string' && uri.includes('ngrok')) {
    headers.set('ngrok-skip-browser-warning', 'true');
  }
  
  return fetch(uri, {
    ...init,
    headers,
  });
};

const httpLink = createHttpLink({
  uri: `${API_URL}/graphql`,
  fetch: customFetch,
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
    if ('statusCode' in networkError) {
      console.error(`Status code: ${networkError.statusCode}`);
    }
    if ('result' in networkError) {
      console.error(`Response:`, networkError.result);
    }
    console.error(`Full error:`, JSON.stringify(networkError, null, 2));
  }
});

const authLink = setContext(async (_, { headers }) => {
  const token = await mobileAuthService.getToken();
  console.log('Auth token available:', !!token);
  
  const newHeaders: Record<string, string> = {
    ...headers,
    authorization: token ? `Bearer ${token}` : '',
  };
  
  // Add ngrok header if using ngrok
  if (API_URL.includes('ngrok')) {
    newHeaders['ngrok-skip-browser-warning'] = 'true';
  }
  
  return {
    headers: newHeaders,
  };
});

export const client = new ApolloClient({
  link: errorLink.concat(loggingLink).concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  connectToDevTools: __DEV__,
}); 