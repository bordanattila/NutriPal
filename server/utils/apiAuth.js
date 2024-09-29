const axios = require('axios');  // Using axios for the HTTP request instead of request.
const qs = require('qs');  // The qs module is used to properly format the data as application/x-www-form-urlencoded.
require('dotenv').config();
const { CLIENT_ID, CLIENT_SECRET } = process.env;

let accessToken;

// Function to get the OAuth 2.0 access token
async function getAccessToken() {
  const tokenUrl = 'https://oauth.fatsecret.com/connect/token';
  const data = qs.stringify({
    grant_type: 'client_credentials',
    scope: 'basic'
  });

  try {
    const response = await axios.post(tokenUrl, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
      }
    });

    accessToken = response.data.access_token;
    console.log('Access Token:', accessToken);
    return accessToken;
  } catch (error) {
    console.error('Error fetching access token:', error.response ? error.response.data : error.message);
  }
}

// Function to share accessToken with other API calls
async function getAccessTokenValue() {
  if (!accessToken) {
    console.log('Waiting for access token')
    await getAccessToken();
  }
  return accessToken
}

module.exports = { getAccessToken, getAccessTokenValue};