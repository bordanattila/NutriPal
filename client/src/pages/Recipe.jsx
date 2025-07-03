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

const Recipe = () => {
  // refresh token & redirect if unauthorized
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

  // fetch user
  const { data, loading, error } = useQuery(GET_USER, {
    context: { headers: { Authorization: `Bearer ${Auth.getToken()}` } },
    onError: () => navigate('/login'),
  });
  const userId = data?.user?._id;

  // Identify source page for FoodDetails.jsx
  const sourcePage = 'recipe';

  // form fields with localStorage persistence
  const [recipeName, setRecipeName] = useState(() => localStorage.getItem('recipeName') || '');
  const [numberOfServings, setNumberOfServings] = useState(() => localStorage.getItem('numOfServings') || '');
  const [servingSize, setServingSize] = useState(() => localStorage.getItem('servingSize') || '1');

  useEffect(() => {
    localStorage.setItem('recipeName', recipeName);
  }, [recipeName]);
  useEffect(() => {
    localStorage.setItem('numOfServings', numberOfServings);
  }, [numberOfServings]);
  useEffect(() => {
    localStorage.setItem('servingSize', servingSize);
  }, [servingSize]);

  // save recipe handler
  const handleAddRecipe = async () => {
    if (
      !userId ||
      !recipeName.trim() ||
      ingredientsList.length === 0 ||
      !numberOfServings.trim() ||
      !servingSize.trim()
    ) {
      toast.error('Fill all fields and add ≥1 ingredient');
      return;
    }
    const payload = {
      user_id: userId,
      recipeName: recipeName.trim(),
      ingredients: ingredientsList.map(i => i.id),
      servings: Number(numberOfServings),
      servingSize: servingSize.trim(),
    };
    try {
      const res = await api.post('api/recipe', { json: payload });
      if (res.ok) {
        toast.success('Recipe added!');
        clear();
        setRecipeName('');
        setNumberOfServings('');
        setServingSize('1');
        setTimeout(() => navigate('/saved-recipes'), 800);
      } else {
        toast.error('Failed to add recipe');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error adding recipe');
    }
  };

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white">
      {/* Recipe metadata */}
      <input
        type="text"
        placeholder="Recipe name"
        value={recipeName}
        onChange={e => setRecipeName(e.target.value)}
        className="w-full max-w-lg border p-2 m-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />
      <input
        type="text"
        placeholder="Number of servings"
        value={numberOfServings}
        onChange={e => setNumberOfServings(e.target.value)}
        className="w-full max-w-lg border p-2 m-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />
      <input
        type="text"
        placeholder="Serving size (1 plate)"
        value={servingSize}
        onChange={e => setServingSize(e.target.value)}
        className="w-full max-w-lg border p-2 m-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />

      {/* Search and pick ingredients */}
      <FoodSearchList onPick={food => navigate(`/${sourcePage}/foodById/${food.food_id}`)} />

      {/* Selected Ingredients */}
      <h2 className="mt-6 text-xl font-semibold text-teal-700">Ingredients</h2>
      <ItemList
        items={ingredientsList}
        renderItem={item => (
          <span>
            {item.name} <span className="text-sm text-gray-600">({item.brand})</span>
          </span>
        )}

        onRemove={remove}
      />

      {/* Save Button */}
      <button
        onClick={handleAddRecipe}
        className="mt-6 bg-gradient-to-r from-green-400 to-teal-500 text-white font-bold py-2 px-6 rounded-full shadow hover:from-green-500 hover:to-blue-500 transition"
      >
        Save Recipe
      </button>

      <ToastContainer position="bottom-center" autoClose={800} />
    </div>
  );
};

export default Recipe;
