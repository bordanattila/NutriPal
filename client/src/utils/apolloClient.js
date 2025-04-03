/**
 * @file apolloClient.js
 * @description Sets up the Apollo Client for making authenticated GraphQL requests using JWT.
 */
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

/**
 * @constant httpLink
 * @description The HTTP connection to the GraphQL server
 */
const httpLink = createHttpLink({
  uri: process.env.REACT_APP_API_URL+'/graphql', // GraphQL endpoint
});

/**
 * @constant authLink
 * @description Middleware for attaching the JWT from localStorage to outgoing GraphQL requests
 */
const authLink = setContext((_, { headers }) => {
    // Get the authentication token from local storage if it exists
  const token = localStorage.getItem('id_token');
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

/**
 * @constant client
 * @description Configured Apollo Client instance with auth middleware and caching
 */
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
export default client;