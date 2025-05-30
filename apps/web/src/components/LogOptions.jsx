/**
 * @file LogOptions.jsx
 * @module LogOptions
 * @description Provides options to log food from different sources such as search, recipes, or meals.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ky from 'ky';

/**
 * Configure the API client with base URL and credentials.
 */
const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
  credentials: 'include',
});

/**
 * Component that renders three buttons to allow users to log food from search, recipes, or meals.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.userId - ID of the current logged-in user.
 * @returns {JSX.Element}
 */
const LogOptions = ({ userId }) => {
  const navigate = useNavigate();

  /**
   * Navigate user to the food search page.
   */
  const handleSearchClick = () => {
    navigate('/search');
  };

  /**
   * Navigate user to the saved recipes page to log from a recipe.
   */
  const handleLogFromRecipe = async () => {    
      navigate('/saved-recipes');   
  };

  /**
   * Fetch saved meals from the backend and navigate to the saved meals page with data.
   */
  const handleLogFromMeal = async () => {
    try {
      const response = await api.get(`api/saved-meals/${userId}`).json();
      navigate('/saved-meals', { state: { meals: response } });
    } catch (error) {
      console.error('Failed to fetch saved meals:', error);
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center justify-center p-6 max-w-md mx-auto">
      <button
        onClick={handleSearchClick}
        className="w-full py-6 text-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-2xl shadow-lg transition"
      >
        Search Food
      </button>

      <button
        onClick={handleLogFromRecipe}
        className="w-full py-6 text-lg font-semibold text-white bg-green-500 hover:bg-green-600 rounded-2xl shadow-lg transition"
      >
        Log From Recipe
      </button>

      <button
        onClick={handleLogFromMeal}
        className="w-full py-6 text-lg font-semibold text-white bg-purple-500 hover:bg-purple-600 rounded-2xl shadow-lg transition"
      >
        Log a Meal - coming soon
      </button>
    </div>
  );
};

export default LogOptions;
