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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Food Tracker</h1>
      <h2 className="text-2xl font-medium text-gray-600 mb-8">The #1 nutrition app</h2>
      <button onClick={handleLoginClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Login</button>
      <h3 className="text-xl font-medium text-gray-600 mt-4 mb-4">Not a member yet? Sign up</h3>
      <button onClick={handleSignupClick} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Signup</button>
    </div>
  );
};

export default Home;