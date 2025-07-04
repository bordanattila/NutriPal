import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

const Meal = () => {
  // Ensure token is fresh & redirect if not
  useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    items: ingredientsList,
    add,
    remove,
    clear,
  } = useItemCollector('ingredientsList');

  useEffect(() => {
    const {
      ingredientID,
      addedIngredient,
      ingredientServingCount,
      IngredientServingSize,
    } = location.state || {};

    if (ingredientID) {
      add({
        id: ingredientID,
        name: addedIngredient,
        servingCount: ingredientServingCount,
        servingSize: IngredientServingSize,
      });
      // wipe out the navigation state so it only runs once
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, add, navigate, location.pathname]);

  // Fetch current user
  const { data, loading, error } = useQuery(GET_USER, {
    context: { headers: { Authorization: `Bearer ${Auth.getToken()}` } },
    onError: () => navigate('/login'),
  });
  const userId = data?.user?._id;

    // Identify source page for FoodDetails.jsx
    const sourcePage = 'meal';

  // LocalStorage-backed form fields
  const [mealName, setMealName] = useState(() => localStorage.getItem('mealName') || '');
  const [numberOfServings, setNumberOfServings] = useState(() => localStorage.getItem('numOfServings') || '');
  const [servingSize, setServingSize] = useState(() => localStorage.getItem('servingSize') || '1');

  // Keep localStorage up to date
  useEffect(() => {
    localStorage.setItem('mealName', mealName);
  }, [mealName]);
  useEffect(() => {
    localStorage.setItem('numOfServings', numberOfServings);
  }, [numberOfServings]);
  useEffect(() => {
    localStorage.setItem('servingSize', servingSize);
  }, [servingSize]);

  // Handler to save a new meal
  const handleAddMeal = async () => {
    if (
      !userId ||
      !mealName.trim() ||
      ingredientsList.length === 0 ||
      !numberOfServings.trim() ||
      !servingSize.trim()
    ) {
      toast.error('Please fill all fields and add at least one ingredient.');
      return;
    }

    const newMeal = {
      user_id: userId,
      mealName: mealName.trim(),
      ingredients: ingredientsList.map((item) => item.id),
      servings: Number(numberOfServings),
      servingSize: servingSize.trim(),
    };

    try {
      const response = await api.post('api/meal', { json: newMeal });
      if (response.ok) {
        toast.success('Meal added successfully!');
        // Reset form & stored data
        clear();
        setMealName('');
        setNumberOfServings('');
        setServingSize('1');
        setTimeout(() => navigate('/saved-meals'), 1000);
      } else {
        toast.error('Failed to add meal.');
      }
    } catch (err) {
      console.error('Error adding meal:', err);
      toast.error('Error adding meal. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-max p-6">
      {/* Meal Name */}
      <input
        type="text"
        id="mealName"
        name="mealName"
        placeholder="Meal name"
        value={mealName}
        onChange={(e) => setMealName(e.target.value)}
        className="border p-2 m-2 rounded-full bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
        required
      />

      {/* Number of Servings */}
      <input
        type="text"
        id="mealNumOfServings"
        name="mealNumOfServings"
        placeholder="Number of servings"
        value={numberOfServings}
        onChange={(e) => setNumberOfServings(e.target.value)}
        className="border p-2 m-2 rounded-full bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
        required
      />

      {/* Serving Size */}
      <input
        type="text"
        id="mealServingSize"
        name="mealServingSize"
        placeholder="Serving size (e.g., 1 plate)"
        value={servingSize}
        onChange={(e) => setServingSize(e.target.value)}
        className="border p-2 m-2 rounded-full bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
        required
      />


      {/* Search and pick ingredients */}
      <FoodSearchList onPick={food => navigate(`/${sourcePage}/foodById/${food.food_id}`)} />

      {/* Display Selected Ingredients */}
      <h2 className="mt-6 text-xl font-semibold text-teal-700">Ingredients</h2>
      <ItemList
        items={ingredientsList}
        renderItem={(item) => (
          <div>
            <strong>{item.name}</strong> <span className="brandVisibility">({item.brand})</span>
          </div>
        )}
        onRemove={remove}
      />

      {/* Save Meal Button */}
      <div
        onClick={handleAddMeal}
        className="flex items-center justify-center mt-4 bg-gradient-to-r from-green-400 to-teal-500 rounded-full shadow-lg hover:from-green-400 hover:to-blue-600 transition duration-300 text-white font-bold py-2 px-6 cursor-pointer"
      >
        Save Meal
      </div>

      {/* Toast Notifications */}
      <ToastContainer autoClose={500} />
    </div>
  );
};

export default Meal;
