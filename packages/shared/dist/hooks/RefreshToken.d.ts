export default useAuth;
/**
 * Custom React hook to validate JWT token on mount.
 *
 * - Automatically checks if the token is expired.
 * - If expired, attempts to refresh it using the stored refresh token.
 * - Redirects to the login page if refresh fails.
 *
 * @function useAuth
 */
declare function useAuth(): void;
//# sourceMappingURL=RefreshToken.d.ts.map