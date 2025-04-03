/**
 * @file apiAuth.js
 * @description Handles OAuth 2.0 authentication with FatSecret API. Exports utility functions for requesting and storing access tokens.
 */
const axios = require('axios');  // Using axios for the HTTP request instead of request.
const qs = require('qs');  // The qs module is used to properly format the data as application/x-www-form-urlencoded.
require('dotenv').config();
const { CLIENT_ID, CLIENT_SECRET } = process.env;

let accessToken;
let tokenExpiration;

/**
 * @function getAccessToken
 * @async
 * @description Requests a new access token from the FatSecret OAuth endpoint using client credentials.
 * @returns {Promise<string>} The new access token.
 */
async function getAccessToken() {
  // const tokenUrl = 'https://3.87.33.87/connect/token';
  const tokenUrl = 'https://oauth.fatsecret.com/connect/token';
  const data = qs.stringify({
    grant_type: 'client_credentials',
    scope: 'basic premier barcode'
  });

  try {
    const response = await axios.post(tokenUrl, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
      }
    });

    accessToken = response.data.access_token;
    tokenExpiration = Date.now() + response.data.expires_in * 1000;
    return accessToken;
  } catch (error) {
    console.error('Error fetching access token:', error.response ? error.response.data : error.message);
  }
}

/**
 * @function getAccessTokenValue
 * @async
 * @description Returns a valid access token. Refreshes it if expired or missing.
 * @returns {Promise<string>} The valid (cached or refreshed) access token.
 */
async function getAccessTokenValue() {
  if (!accessToken || Date.now() >= tokenExpiration) {
    console.log('Waiting for access token')
    await getAccessToken();
  }
  return accessToken
}

module.exports = { getAccessToken, getAccessTokenValue};