import React, { useState } from 'react';
import ky from 'ky';
import { useNavigate } from 'react-router-dom';
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../utils/mutations";
import Auth from "../utils/auth";

// Create a ky instance with a prefix URL
const api = ky.create({
  prefixUrl: 'http://localhost:3000', 
});

// Define the Login component
const Login = () => {
  // Initialize state for username and password
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 // Add a state for error messages
 const [error, setError] = useState(null); 
 // Initialize history
 const navigate = useNavigate(); 

 // Define the handleSubmit function
 const handleSubmit = async (e) => {
   e.preventDefault();
   setError(null);
   try {
     // Make a POST request to the login endpoint
     const response = await api.post('login', {
       json: { username, password },
     });

     // Check if the response is OK
    //  if (response.ok) {
      const data = await response.json();
      console.log('Login response:', data);
      if (data && data.login && data.login.token) {
      // Store the token using Auth service
      Auth.login(data.login.token); // Assuming the token is in data.login.token
      navigate('/dashboard'); // Navigate to the dashboard
    } else {
      // Handle non-200 responses
      const errorData = await response.json();
      setError(errorData.error || `Error logging in: ${response.status}`);
    }
  } catch (error) {
    // Handle network or other errors
    setError(`Error logging in: ${error.message}`);
  }
 };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-medium text-gray-600 mb-8">Login</h1>
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
        {/* Display error messages */}
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>} 
      </form>
    </div>
  );
};

export default Login;