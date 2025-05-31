"use strict";
/**
 * @file apiAuth.js
 * @description Handles fetching and caching of FatSecret OAuth 2.0 access tokens for client-side API use.
 */
const ky = require('ky'); // Importing the ky library for HTTP requests.
const qs = require('qs'); // The qs module is used to properly format the data 
const { REACT_APP_CLIENT_ID, REACT_APP_CLIENT_SECRET } = process.env;
let accessToken;
let tokenExpiration;
/**
 * Fetches a new access token from the FatSecret OAuth 2.0 token endpoint.
 * @async
 * @function getAccessToken
 * @returns {Promise<string>} The newly fetched access token
 */
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
        });
        const json = await response.json();
        accessToken = json.access_token;
        const expiresIn = json.expires_in;
        tokenExpiration = Date.now() + expiresIn * 1000; // Calculate the expiration time
        console.log('Access token fetched successfully.');
        return accessToken;
    }
    catch (error) {
        console.error('Error fetching access token:', error.response ? await error.response.json() : error.message);
    }
}
/**
 * Returns a valid access token, fetching a new one if expired or missing.
 * @async
 * @function getAccessTokenValue
 * @returns {Promise<string>} Valid access token
 */
async function getAccessTokenValue() {
    if (!accessToken || Date.now() >= tokenExpiration) {
        console.log('Access token expired or missing, fetching a new one...');
        await getAccessToken();
    }
    return accessToken;
}
module.exports = { getAccessToken, getAccessTokenValue };
