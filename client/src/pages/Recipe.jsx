// src/pages/Recipe.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import useAuth from '../hooks/RefreshToken';
import useItemCollector from '../hooks/ingredientCollector';
import FoodSearchList from '../components/FoodSearchList';
import ItemList from '../components/ItemList';
import api from '../utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Recipe = () => {
  // Ensure token is fresh & redirect if not
  useAuth();
  const navigate = useNavigate();

  // Fetch current user
  const { data, loading, error } = useQuery(GET_USER, {
    context: { headers: { Authorization: `Bearer ${Auth.getToken()}` } },
    onError: () => navigate('/login'),
  });
  const userId = data?.user?._id;

  // LocalStorage-backed form fields
  const [recipeName, setRecipeName] = useState(() => localStorage.getItem('recipeName') || '');
  const [numberOfServings, setNumberOfServings] = useState(() => localStorage.getItem('numOfServings') || '');
  const [servingSize, setServingSize] = useState(() => localStorage.getItem('servingSize') || '1');

  // Keep localStorage up to date
  useEffect(() => {
    localStorage.setItem('recipeName', recipeName);
  }, [recipeName]);
  useEffect(() => {
    localStorage.setItem('numOfServings', numberOfServings);
  }, [numberOfServings]);
  useEffect(() => {
    localStorage.setItem('servingSize', servingSize);
  }, [servingSize]);

  // Manage the list of picked ingredients
  const {
    items: ingredientsList,
    add: addIngredient,
    remove: removeIngredient,
    clear: clearIngredients,
  } = useItemCollector('ingredientsList');

  // Handler to save a new recipe
  const handleAddRecipe = async () => {
    if (
      !userId ||
      !recipeName.trim() ||
      ingredientsList.length === 0 ||
      !numberOfServings.trim() ||
      !servingSize.trim()
    ) {
      toast.error('Please fill all fields and add at least one ingredient.');
      return;
    }

    const newRecipe = {
      user_id: userId,
      recipeName: recipeName.trim(),
      ingredients: ingredientsList.map((item) => item.id),
      servings: Number(numberOfServings),
      servingSize: servingSize.trim(),
    };

    try {
      const response = await api.post('api/recipe', { json: newRecipe });
      if (response.ok) {
        toast.success('Recipe added successfully!');
        // Reset form & stored data
        clearIngredients();
        setRecipeName('');
        setNumberOfServings('');
        setServingSize('1');
        setTimeout(() => navigate('/saved-recipes'), 1000);
      } else {
        toast.error('Failed to add recipe.');
      }
    } catch (err) {
      console.error('Error adding recipe:', err);
      toast.error('Error adding recipe. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-max p-6">
      {/* Recipe Name */}
      <input
        type="text"
        id="recipeName"
        name="recipeName"
        placeholder="Recipe name"
        value={recipeName}
        onChange={(e) => setRecipeName(e.target.value)}
        className="border p-2 m-2 rounded-full bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
        required
      />

      {/* Number of Servings */}
      <input
        type="text"
        id="recipeNumOfServings"
        name="recipeNumOfServings"
        placeholder="Number of servings"
        value={numberOfServings}
        onChange={(e) => setNumberOfServings(e.target.value)}
        className="border p-2 m-2 rounded-full bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
        required
      />

      {/* Serving Size */}
      <input
        type="text"
        id="recipeServingSize"
        name="recipeServingSize"
        placeholder="Serving size (e.g., 1 plate)"
        value={servingSize}
        onChange={(e) => setServingSize(e.target.value)}
        className="border p-2 m-2 rounded-full bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
        required
      />

      {/* Food Search & Pick */}
      <FoodSearchList
        onPick={(food) =>
          addIngredient({
            id: food.food_id,
            name: food.food_name,
            brand: food.brand_name,
          })
        }
      />

      {/* Display Selected Ingredients */}
      <ItemList
        items={ingredientsList}
        renderItem={(item) => (
          <div>
            <strong>{item.name}</strong> <span className="brandVisibility">({item.brand})</span>
          </div>
        )}
        onRemove={removeIngredient}
      />

      {/* Save Recipe Button */}
      <div
        onClick={handleAddRecipe}
        className="flex items-center justify-center mt-4 bg-gradient-to-r from-green-400 to-teal-500 rounded-full shadow-lg hover:from-green-400 hover:to-blue-600 transition duration-300 text-white font-bold py-2 px-6 cursor-pointer"
      >
        Save Recipe
      </div>

      {/* Toast Notifications */}
      <ToastContainer autoClose={500} />
    </div>
  );
};

export default Recipe;
