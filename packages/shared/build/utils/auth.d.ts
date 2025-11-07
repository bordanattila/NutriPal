export default authService;
declare const authService: AuthService;
/**
 * @class AuthService
 * @classdesc Utility class for managing user authentication and tokens on the client.
 */
declare class AuthService {
    /**
     * Get decoded user profile from token.
     * @returns {Object|null} Decoded token payload
     */
    getProfile: () => Object | null;
    /**
    * Check if the user is currently logged in.
    * @returns {boolean}
    */
    loggedIn: () => boolean;
    /**
    * Determine if token is expired.
    * @param {string} token - JWT token string
    * @returns {boolean}
    */
    isTokenExpired: (token: string) => boolean;
    /**
     * Retrieve JWT from localStorage.
     * @returns {string|null}
     */
    getToken: () => string | null;
    /**
   * Save JWT to localStorage and redirect to dashboard.
   * @param {string} idToken - JWT token
   */
    login: (idToken: string) => void;
    /**
     * Attempt to refresh token using stored refresh token.
     * @returns {Promise<boolean>} Success of token refresh
     */
    refreshToken: () => Promise<boolean>;
    /**
     * Clear token and redirect to homepage.
     */
    logout: () => void;
    /**
     * Decode a JWT token safely.
     * @param {string} token - JWT string
     * @returns {Object|null} Decoded payload
     */
    decodeToken: (token: string) => Object | null;
}
//# sourceMappingURL=auth.d.ts.map