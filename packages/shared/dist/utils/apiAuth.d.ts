/**
 * Fetches a new access token from the FatSecret OAuth 2.0 token endpoint.
 * @async
 * @function getAccessToken
 * @returns {Promise<string>} The newly fetched access token
 */
export function getAccessToken(): Promise<string>;
/**
 * Returns a valid access token, fetching a new one if expired or missing.
 * @async
 * @function getAccessTokenValue
 * @returns {Promise<string>} Valid access token
 */
export function getAccessTokenValue(): Promise<string>;
//# sourceMappingURL=apiAuth.d.ts.map