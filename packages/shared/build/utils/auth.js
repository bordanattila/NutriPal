/**
 * @file auth.js
 * @description Client-side authentication utility to handle JWT tokens, login state, token refreshing, and redirection.
 */
import { jwtDecode } from 'jwt-decode';
import ky from 'ky';
/**
 * @constant api
 * @description Ky instance for authenticated HTTP requests
 */
const api = ky.create({
    prefixUrl: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
/**
 * @class AuthService
 * @classdesc Utility class for managing user authentication and tokens on the client.
 */
class AuthService {
    constructor() {
        /**
         * Get decoded user profile from token.
         * @returns {Object|null} Decoded token payload
         */
        this.getProfile = () => {
            return this.decodeToken(this.getToken());
        };
        /**
        * Check if the user is currently logged in.
        * @returns {boolean}
        */
        this.loggedIn = () => {
            const token = this.getToken();
            return !!token && !this.isTokenExpired(token);
        };
        /**
        * Determine if token is expired.
        * @param {string} token - JWT token string
        * @returns {boolean}
        */
        this.isTokenExpired = (token) => {
            const decoded = this.decodeToken(token);
            const isExpired = decoded ? decoded.exp < Date.now() / 1000 : true; // Return true if token is invalid or expired
            return isExpired;
        };
        /**
         * Retrieve JWT from localStorage.
         * @returns {string|null}
         */
        this.getToken = () => {
            const token = localStorage.getItem('id_token');
            return token;
        };
        /**
       * Save JWT to localStorage and redirect to dashboard.
       * @param {string} idToken - JWT token
       */
        this.login = (idToken) => {
            // localStorage.removeItem('id_token');
            localStorage.setItem('id_token', idToken);
            window.location.assign('/dashboard');
        };
        /**
         * Attempt to refresh token using stored refresh token.
         * @returns {Promise<boolean>} Success of token refresh
         */
        this.refreshToken = async () => {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await api.post('api/refresh', {
                        json: { refreshToken }
                    }).json();
                    const newToken = response.token;
                    // Update the access token
                    localStorage.setItem('id_token', newToken);
                    return true; // Return true on success
                }
                catch (error) {
                    console.error('Token refresh failed:', error);
                    return false; // Return false on failure
                }
            }
        };
        /**
         * Clear token and redirect to homepage.
         */
        this.logout = () => {
            localStorage.removeItem('id_token');
            localStorage.removeItem('refreshToken');
            window.location.assign('/');
        };
        /**
         * Decode a JWT token safely.
         * @param {string} token - JWT string
         * @returns {Object|null} Decoded payload
         */
        this.decodeToken = (token) => {
            try {
                return jwtDecode(token);
            }
            catch (err) {
                console.error('Token decoding failed:', err);
                return null; // Return null if decoding fails
            }
        };
    }
}
const authService = new AuthService();
export default authService;
