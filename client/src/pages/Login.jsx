import React, { useState } from 'react';
import ky from 'ky';
import { useNavigate } from 'react-router-dom';

const api = ky.create({
  prefixUrl: 'http://localhost:3000', 
});

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize history

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('login', {
        json: { username, password }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.error) {
          console.error(data.error);
        } else {
          // Store the user's ID in the session
          const userId = data.userId;
          // Navigate to the dashboard page
          navigate('/dashboard');
        }
      } else {
        console.error('Error logging in:', response.status);
      }
    } catch (error) {
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;