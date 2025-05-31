/**
 * @file Recipe.jsx
 * @description Allows users to create custom recipes by adding ingredients from the food search.
 * Ingredients are persisted using localStorage until saved to the backend.
 */

import React, { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import ky from 'ky';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Auth from '@nutripal/shared/src/utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '@nutripal/shared/src/utils/mutations';
import useAuth from '@nutripal/shared/src/hooks/RefreshToken';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleSearch } from '../components/SearchComponent';

/**
 * @constant api
 * @description Pre-configured ky instance with API base URL.
 */
const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});

/**
 * @component Recipe
 * @description Page for creating, saving, and viewing ingredients in a custom recipe.
 * @returns {JSX.Element}
 */
const Recipe = () => {
  useAuth(); // Refresh token if needed
  const navigate = useNavigate();
  const location = useLocation();

  // Form and state fields
  const [recipeName, setRecipeName] = useState('');
  const [numberOfServings, setNumberOfServings] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [ingredientsList, setIngredientsList] = useState([]);
  const [ingredientsID, setIngredientsID] = useState([]);
  const [foodName, setFoodName] = useState('');
  const [arrayToDisplay, setArrayToDisplay] = useState([]);
  const [error, setError] = useState(null);
  const [userID, setUserID] = useState(null);
  // Destructure values from navigation state (ingredient data passed from FoodDetails)
  const { ingredientID, addedIngredient, ingredientServingCount, IngredientServingSize } = location.state || {};

  /**
   * @hook useQuery
   * @description Fetch authenticated user info
   */

  const { loading, data, logError } = useQuery(GET_USER, {
    context: {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    },
    onError: () => {
      navigate('/');
    }
  });

  /**
   * @hook useEffect
   * @description Set user ID once user data is loaded
   */
  useEffect(() => {
    if (data?.user) {
      setUserID(data.user._id);
    }
  }, [data]);

  // Identify source page for FoodDetails.jsx
  const sourcePage = 'recipe';

  /**
   * @function onSearchSubmit
   * @description Handles search submission and populates search result array
   */
  const onSearchSubmit = async (e) => {
    e.preventDefault();
    await handleSearch({
      name: foodName,
      setArray: setArrayToDisplay,
      setError: setError,
    });
  };

  /** @function clearSearch - Clears food search input and results */
  const clearSearch = () => {
    setFoodName('');
    setArrayToDisplay([]);
  };


  /**
   * @hook useEffect
   * @description Load recipe fields from localStorage
   */
  useEffect(() => {
    const storedName = localStorage.getItem('recipeName');
    const storedNumOfServings = localStorage.getItem('numOfServings');
    const storedServingsSize = localStorage.getItem('servingSize');
    if (storedName) setRecipeName(storedName);
    if (storedNumOfServings) setNumberOfServings(storedNumOfServings);
    if (storedServingsSize) setServingSize(storedServingsSize);
  }, []);



  /**
   * @hook useEffect
   * @description Append new ingredient to localStorage and update state
   */
  useEffect(() => {
    if (addedIngredient && ingredientID) {
      // Get the stored ingredients list from localStorage, if it exists.
      const storedIngredients = localStorage.getItem('ingredientsList');
      const currentList = storedIngredients ? JSON.parse(storedIngredients) : [];

      // Append the new ingredient to the current list.
      const ingredientObj = {
        name: addedIngredient,
        servingCount: ingredientServingCount,
        servingSize: IngredientServingSize,
      };
      const updatedList = [...currentList, ingredientObj];

      // Save the updated list back to localStorage and update state.
      localStorage.setItem('ingredientsList', JSON.stringify(updatedList));
      setIngredientsList(updatedList);
    }
  }, [addedIngredient, ingredientID, ingredientServingCount, IngredientServingSize]);


  /**
   * @hook useEffect
   * @description Update stored ingredient ID list in localStorage
   */
  useEffect(() => {
    if (addedIngredient && ingredientID) {
      const storedIDs = localStorage.getItem('ingredientsID');
      const currentIDs = storedIDs ? JSON.parse(storedIDs) : [];
      const updatedIDs = [...currentIDs, ingredientID];
      localStorage.setItem('ingredientsID', JSON.stringify(updatedIDs));
      setIngredientsID(updatedIDs);
    }
  }, [addedIngredient, ingredientID]);


  /**
   * @hook useEffect
   * @description Load ingredients and IDs from localStorage
   */
  useEffect(() => {
    const storedIngredientsList = localStorage.getItem('ingredientsList');
    const storedIngredientsID = localStorage.getItem('ingredientsID');
    if (storedIngredientsList) {
      setIngredientsList(JSON.parse(storedIngredientsList));
    }
    if (storedIngredientsID) {
      setIngredientsID(JSON.parse(storedIngredientsID));
    }
  }, []);


  /**
   * @function clearIngredients
   * @description Clears all ingredient and recipe form data + localStorage
   */
  const clearIngredients = () => {
    setIngredientsList([]);
    setIngredientsID([]);
    setRecipeName('');
    setNumberOfServings('');
    setServingSize('');
    localStorage.removeItem('ingredientsList');
    localStorage.removeItem('ingredientsID');
    localStorage.removeItem('recipeName');
    localStorage.removeItem('numOfServings');
    localStorage.removeItem('servingSize');
  };

  /**
   * @function handleRemoveIngredient
   * @description Removes an ingredient from the list by index
   * @param {number} index - Index of the ingredient to remove
   */
  const handleRemoveIngredient = (index) => {
    const updatedIngredients = ingredientsList.filter((_, i) => i !== index);
    const updatedIDs = ingredientsID.filter((_, i) => i !== index); // keep IDs in sync 

    setIngredientsList(updatedIngredients);
    setIngredientsID(updatedIDs);

    localStorage.setItem('ingredientsList', JSON.stringify(updatedIngredients));
    localStorage.setItem('ingredientsID', JSON.stringify(updatedIDs));
  }

  /**
   * @function handleAddRecipe
   * @description Sends a POST request to create a new recipe with form values and ingredient IDs
   */
  const handleAddRecipe = async (req, res) => {
    const newRecipe = {
      user_id: userID,
      recipeName: recipeName,
      ingredients: ingredientsID,
      servings: numberOfServings,
      servingSize: servingSize,
    }
    try {
      // Create Recipe document
      const recipeResponse = await api.post('api/recipe', {
        json: newRecipe,
      });
      // const recipeData = await recipeResponse.json();

      if (!recipeResponse.ok) {
        throw new Error('Failed to create recipe.');
      }

      if (recipeResponse.ok) {
        clearIngredients();
        toast.success('Recipe added successfully!');
        setTimeout(() => { }, 1000)
      } else {
        toast.error('Failed to add Recipe.');
      }
    } catch (error) {
      console.error('Error adding recipe creation:', error);
      toast.error('Error adding recipe creation. Please try again.');
    }
  }

  // Handle loading and error states
  if (loading) return <div>Loading...</div>;
  if (logError) return <div>Error: {error.message}</div>;

  // UI rendering
  return (
    <div className="flex flex-col items-center justify-center min-h-max p-6">
      <div>
        <label htmlFor="recipeName" className="sr-only">Recipe name</label>
        <input
          type="text"
          id="recipeName"
          name="recipeName"
          placeholder="Recipe name"
          aria-autocomplete='list'
          value={recipeName}
          onChange={(e) => {
            const newValue = e.target.value;
            setRecipeName(newValue);
            localStorage.setItem('recipeName', newValue);
          }}
          required
          className="border p-2 m-2 rounded-full bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
        />
      </div>
      <div>
        <label htmlFor="recipeNumOfServings" className="sr-only">Number of servings</label>
        <input
          type="text"
          id="recipeNumOfServings"
          name="recipeNumOfServings"
          placeholder="Number of servings"
          aria-autocomplete='list'
          value={numberOfServings}
          onChange={(e) => {
            const newValue = e.target.value;
            setNumberOfServings(newValue);
            localStorage.setItem('numOfServings', newValue);
          }}
          required
          className="border p-2 m-2 rounded-full bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md "
        />
      </div>
      <div>
        <label htmlFor="recipeServingSize" className="sr-only">Servings size</label>
        <input
          type="text"
          id="recipeServingSize"
          name="recipeServingSize"
          placeholder="Servings size (1 plate)"
          aria-autocomplete='list'
          value={servingSize}
          onChange={(e) => {
            const newValue = e.target.value;
            setServingSize(newValue);
            localStorage.setItem('servingSize', newValue);
          }}
          required
          className="border p-2 m-2 rounded-full bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md "
        />
      </div>
      <SearchBar
        nameOfFood={foodName}
        setNameOfFood={setFoodName}
        handleSearch={onSearchSubmit}
        clearSearch={clearSearch}
        error={error}
      />
      {/* Search Results */}
      <ul className="list-none mt-4 w-full max-w-lg">
        {arrayToDisplay.map((food) => (
          <li key={food.food_id} className="py-2 ">
            <div className='rounded-md p-2 bg-teal-100'>
              <Link to={`/${sourcePage}/foodById/${food.food_id}`} className="text-blue-700 hover:underline">
                <strong>{food.food_name}</strong> <span className='brandVisibility'>({food.brand_name})</span>
                <br />
                <span className='text-sm'>{food.food_description}</span>
                <br />
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <h3 className='text-2xl font-bold text-teal-700 tracking-wide uppercase mb-4 border-b-2 border-teal-400 pb-2 shadow-sm text-center'>Ingredients</h3>
      <ul className="list-none mt-4 w-full max-w-lg">
        {ingredientsList.length > 0 ? (
          <li className="py-2">
            {
              ingredientsList.map((ingredient, index) => (
                <div className="relative rounded-md p-2 m-2 bg-teal-100">
                  <li className="text-blue-700">
                    <strong>{ingredient.name}</strong><br />
                    <span className="text-sm text-gray-700">
                      Serving Count: {ingredient.servingCount} | Size: {ingredient.servingSize}
                    </span>
                  </li>
                  <button className='absolute right-2 top-1/2 -translate-y-1/2'
                    onClick={() => handleRemoveIngredient(index)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#f00" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              ))
            }
          </li>
        ) : (
          <p className='text-center'>No ingredients found</p>
        )}
      </ul>
      <div>
        <div className="flex flex-row items-center justify-between mt-4 bg-gradient-to-r from-green-400 to-teal-500 rounded-full shadow-lg hover:from-green-400 hover:to-blue-600 transition duration-300 text-white font-bold py-2 px-6 cursor-pointer" onClick={handleAddRecipe}>
          <div>
            <h1>Save recipe </h1>
          </div>
        </div>
        {/* Toaster to provide feedback to user */}
        <ToastContainer autoClose={500} />
      </div>
    </div>
  )
}

export default Recipe;
