/**
 * @file Login.jsx
 * @description Handles user login by submitting credentials and storing a JWT if successful.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Auth from "../utils/auth";
import ky from 'ky';

/**
 * @constant api
 * @description Ky instance pre-configured with base API URL and cookie credentials
 */
const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
  credentials: 'include',
});

/**
 * @component Login
 * @description Login form that authenticates a user, saves the token, and redirects on success.
 * @returns {JSX.Element}
 */
const Login = () => {
  /** @state {string} username - Controlled input for username */
  const [username, setUsername] = useState('');

  /** @state {string} password - Controlled input for password */
  const [password, setPassword] = useState('');

  /** @state {string|null} error - Error message shown on login failure */
  const [error, setError] = useState(null);

  /** @state {boolean} loading - Indicates if login is processing */
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /**
   * @function useEffect
   * @description Runs on mount; attempts token refresh if user is logged in but token is expired.
   */
  useEffect(() => {
    // Check and refresh token if necessary on component mount
    const refreshTokenIfNeeded = async () => {
      const loggedIn = Auth.loggedIn();
      if (loggedIn && Auth.isTokenExpired(Auth.getToken())) {
        const refreshSuccess = await Auth.refreshToken();
        if (!refreshSuccess) {
          // Log out if token refresh fails
          Auth.logout();
        }
      }
    };
    refreshTokenIfNeeded();
  }, []);

  /**
   * @function handleLoginSubmit
   * @description Submits login form, validates credentials, and stores token if successful.
   * @param {React.FormEvent} e - Form submission event
   */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Make a POST request to the login endpoint
      const response = await api.post('user/login', {
        json: { username, password },
      });
      const data = await response.json();
      if (data?.token) {
        Auth.login(data.token);
        
        // Store refresh token if available
        if (data?.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        console.error('Login error response:', errorData);
        setError(errorData.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) return <div>Loading...</div>;

  // UI rendering
  return (
    <div className="flex flex-col items-center justify-center h-dvh bg-gradient-to-br from-teal-200 via-cyan-300 to-blue-300 p-6">
      <h1>Login</h1>
      <form onSubmit={handleLoginSubmit} className="flex flex-col m-12 gap-8 space-y-4">
        <div>
          <label htmlFor="username" className="sr-only">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full sm:w-1/2 bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

export default Login;