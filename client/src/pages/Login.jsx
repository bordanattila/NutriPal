import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Auth from "../utils/auth";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../utils/mutations";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const [login, { loading }] = useMutation(LOGIN_USER);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const { data } = await login({
        variables: { username, password },
      });

      if (data?.login?.token) {
        // Store token in localStorage and authenticate
        Auth.login(data.login.token); 
        navigate('/dashboard');
      } else {
        setError('Login failed. No token received.');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      setError('Login failed. Check your credentials.'+err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-200 via-cyan-300 to-blue-300 p-6">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default Login;