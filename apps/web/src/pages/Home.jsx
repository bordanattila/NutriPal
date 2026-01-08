/**
 * @file Home.jsx
 * @description Landing page for NutryPal. Redirects authenticated users to dashboard and offers login/signup options.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Auth from "@nutripal/shared/src/utils/auth";

/**
 * @component Home
 * @description Public landing page. Redirects logged-in users to dashboard and provides login/signup navigation.
 * @returns {JSX.Element}
 */
const Home = () => {
  const navigate = useNavigate();
  
  /**
   * @function useEffect
   * @description Redirects user to /dashboard if already logged in
   */
  useEffect(() => {
    // If the user is already logged in, redirect them to the dashboard
    if (Auth.loggedIn()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  /**
   * @function handleLoginClick
   * @description Navigates to the login page
   */
  const handleLoginClick = () => {
    navigate('/login');
  };

  /**
   * @function handleSignupClick
   * @description Navigates to the signup page
   */
  const handleSignupClick = () => {
    navigate('/signup');
  };
  
  // UI rendering
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] max-h-dvh bg-gradient-to-br from-teal-200 via-cyan-300 to-blue-300 p-6">
      <h1 className="text-5xl font-extrabold text-gray-800 mb-4 tracking-tight text-center">Welcome to NutryPal</h1>
      <h2 className="text-2xl font-medium text-gray-700 mb-8 text-center">Your #1 Nutrition Companion</h2>
      
      <button 
        onClick={handleLoginClick} 
        className="w-full sm:w-1/2 bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out">
        Login
      </button>
      
      <h3 className="text-lg font-normal text-gray-600 mt-2 mb-4 text-center">Not a member yet? Sign up below</h3>
      
      <button 
        onClick={handleSignupClick} 
        className="w-full sm:w-1/2 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out mb-6">
        Signup
      </button>
    </div>
  );
};

export default Home;