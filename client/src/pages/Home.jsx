import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <div>
      <h1>Welcome to Food Tracker</h1>
      <h2>The #1 nutrition app</h2>
      <button onClick={() => handleLoginClick()}>Login</button>
      <h3>Not a member yet? Sign up</h3>
      <button onClick={() => handleSignupClick()}>Signup</button>
    </div>
  );
};

export default Home;