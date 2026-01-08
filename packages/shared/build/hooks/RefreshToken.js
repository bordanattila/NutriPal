/**
 * @file RefreshToken.jsx
 * @module useAuth
 * @description React hook to check and refresh JWT token on component mount. If the token is expired and cannot be refreshed, user is redirected to login.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../utils/auth';
/**
 * Custom React hook to validate JWT token on mount.
 *
 * - Automatically checks if the token is expired.
 * - If expired, attempts to refresh it using the stored refresh token.
 * - Redirects to the login page if refresh fails.
 *
 * @function useAuth
 */
const useAuth = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const checkToken = async () => {
            // Check if the current token is expired
            if (AuthService.isTokenExpired(AuthService.getToken())) {
                // Attempt to refresh the token
                const newToken = await AuthService.refreshToken();
                // If refreshing the token fails, redirect to login
                if (!newToken) {
                    navigate('/login');
                }
            }
        };
        // Run the token check on component mount
        checkToken();
    }, [navigate]); // Only re-run if navigate reference changes
};
export default useAuth;
