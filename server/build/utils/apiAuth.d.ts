/**
 * @function getAccessToken
 * @async
 * @description Requests a new access token from the FatSecret OAuth endpoint using client credentials.
 * @returns {Promise<string>} The new access token.
 */
export function getAccessToken(): Promise<string>;
/**
 * @function getAccessTokenValue
 * @async
 * @description Returns a valid access token. Refreshes it if expired or missing.
 * @returns {Promise<string>} The valid (cached or refreshed) access token.
 */
export function getAccessTokenValue(): Promise<string>;
