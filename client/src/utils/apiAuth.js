const ky = require('ky'); // Importing the ky library for HTTP requests.
const qs = require('qs'); // The qs module is used to properly format the data 
const { REACT_APP_CLIENT_ID, REACT_APP_CLIENT_SECRET } = process.env;

let accessToken;
let tokenExpiration;

// Function to get the OAuth 2.0 access token
async function getAccessToken() {
  const tokenUrl = 'https://oauth.fatsecret.com/connect/token';
  const data = qs.stringify({
    grant_type: 'client_credentials',
    scope: 'basic'
  });

  try {
    const credentials = `${REACT_APP_CLIENT_ID}:${REACT_APP_CLIENT_SECRET}`;
    const encodedCredentials = btoa(credentials); 

    const response = await ky.post(tokenUrl, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + encodedCredentials
      },
      body: data
    })
    
    const json = await response.json(); 

    accessToken = json.access_token;
    const expiresIn = json.expires_in; 
    tokenExpiration = Date.now() + expiresIn * 1000; // Calculate the expiration time

    console.log('Access token fetched successfully.');
    return accessToken;
  } catch (error) {
    console.error('Error fetching access token:', error.response ? await error.response.json() : error.message);
  }
}

// Function to share accessToken with other API calls
async function getAccessTokenValue() {
  if (!accessToken || Date.now() >= tokenExpiration) {
    console.log('Access token expired or missing, fetching a new one...');
    await getAccessToken();
  }
  return accessToken;
}

module.exports = { getAccessToken, getAccessTokenValue };
