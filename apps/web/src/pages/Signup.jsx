/**
 * @file Signup.jsx
 * @description Signup page that allows new users to register and log in immediately upon successful registration.
 */
import React, { useState } from 'react';
import ky from 'ky';
import { useNavigate } from 'react-router-dom';
import Auth from "../utils/auth";

/**
 * @constant api
 * @description Pre-configured ky instance for making API requests to the backend.
 */
const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});

/**
 * @component Signup
 * @description Renders a signup form and handles user registration logic.
 * @returns {JSX.Element}
 */

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * @function handleSubmit
   * @description Handles form submission and registers the user via API. On success, logs in the user and navigates to dashboard.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Set loading state to true
    setLoading(true);
    // Reset error state
    setError(null);

    // Simple front-end validation
    if (!username || !email || !password) {
      setError('All fields are required.');
      return;
    }

    try {
      // Call signup API endpoint
      const response = await api.post('user/signup', {
        json: { username, email, password },
      });

      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed.');
      }

      const data = await response.json();

      // Login user immediately upon successful signup
      if (data?.token) {
        Auth.login(data.token);
        
           // Store refresh token if available
           if (data?.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
        navigate('/dashboard');
      } else {
        setError('Login failed. Please try again.');
      }

    } catch (error) {
      console.error('Error signing up:', error);
      console.error('Error details:', error.graphQLErrors); // Log GraphQL errors
      console.error('Network error:', error.networkError)
      // Check if there are any GraphQL errors
      console.error('Error signing up:', error);
      if (error.graphQLErrors) {
        error.graphQLErrors.forEach(({ message }) => {
          console.error('GraphQL Error:', message);
        });
      }
      if (error.networkError) {
        console.error('Network Error:', error.networkError);
      }
      setError('An unexpected error occurred. Please try again.');

      // Display user-friendly error messages
      if (error.message.includes("duplicate key")) {
        setError('Username already taken. Please choose a different username.');
      } else if (error.message.includes("validation failed")) {
        setError('Please ensure all fields are filled out correctly.');
      } else {
        setError(error.message || 'An unexpected error occurred with key. Please try again.');
      }
      console.error('Error signing up:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-dvh bg-gradient-to-br from-teal-200 via-cyan-300 to-blue-300 p-6">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col m-12 gap-8 space-y-4">
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          className="border p-2 rounded"
        />
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="border p-2 rounded"
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full sm:w-1/2 bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Signing up in...' : 'Signup'}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

export default Signup;
