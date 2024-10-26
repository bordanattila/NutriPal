import React, { useState } from 'react';
import ky from 'ky';
import { useNavigate } from 'react-router-dom';
import Auth from "../utils/auth";
import { useMutation } from "@apollo/client";
import { CREATE_USER } from "../utils/mutations";

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [signup] = useMutation(CREATE_USER);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting:', { username, email, password });
    // Set loading state to true
    setLoading(true);
    // Reset error state
    setError(null);

    if (!username || !email || !password) {
      setError('All fields are required.');
      return;
    }

    try {
      await signup({
        variables: { username, email, password },
      });

      // Redirect on success
      navigate('/dashboard');
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

      // Handle different types of errors
      if (error.message.includes("duplicate key")) {
        setError('Username already taken. Please choose a different username.');
      } else if (error.message.includes("validation failed")) {
        setError('Please ensure all fields are filled out correctly.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Error signing up:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
    </div>
  );
};

export default Signup;
