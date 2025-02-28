import React, { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import ky from 'ky';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import useAuth from '../hooks/RefreshToken';
import { PlusIcon } from '@heroicons/react/20/solid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleSearch } from '../components/SearchComponent';

const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});

const Recipe = () => {
  useAuth();
  const [recipeName, setRecipeName] = useState('');
  const [numberOfServings, setNumberOfServings] = useState('');
  const [ingredientsList, setIngredientsList] = useState([]);
  const [ingredientsID, setIngredientsID] = useState([]);
  const [foodName, setFoodName] = useState('');
  const [foodArray, setFoodArray] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { ingredientID, addedIngredient } = location.state || {};

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

  const [userID, setUserID] = useState(null);
  // Set user ID from log data
  useEffect(() => {
    if (data?.user) {
      setUserID(data.user._id);
    }
  }, [data]);

  // Identify source page for FoodDetails.jsx
  const sourcePage = 'recipe';

  const onSearchSubmit = async (e) => {
    e.preventDefault();
    await handleSearch({
      name: foodName,
      setArray: setFoodArray,
      setError: setError,
    });
  };
  // TODO
// style the page

  const clearSearch = () => {
    setFoodName('');
    setFoodArray([]);
  };

  // Add recipe name and num of servings to local storage
  useEffect(() => {
    const storedName = localStorage.getItem('recipeName');
    const storedNumOfServings = localStorage.getItem('numOfServings');
    if (storedName) setRecipeName(storedName);
    if (storedNumOfServings) setNumberOfServings(storedNumOfServings);
  }, []);


  // Add ingredients to local storage
  useEffect(() => {
    if (addedIngredient && ingredientID) {
      // Get the stored ingredients list from localStorage, if it exists.
      const storedIngredients = localStorage.getItem('ingredientsList');
      const currentList = storedIngredients ? JSON.parse(storedIngredients) : [];

      // Append the new ingredient to the current list.
      const updatedList = [...currentList, addedIngredient];

      // Save the updated list back to localStorage and update state.
      localStorage.setItem('ingredientsList', JSON.stringify(updatedList));
      setIngredientsList(updatedList);
    }
  }, [addedIngredient, ingredientID]);

  // Add _id to local storage
  useEffect(() => {
    if (addedIngredient && ingredientID) {
      const storedIDs = localStorage.getItem('ingredientsID');
      const currentIDs = storedIDs ? JSON.parse(storedIDs) : [];
      const updatedIDs = [...currentIDs, ingredientID];
      localStorage.setItem('ingredientsID', JSON.stringify(updatedIDs));
      setIngredientsID(updatedIDs);
    }
  }, [addedIngredient, ingredientID]);

  // Get the list of ingredients and _ids from local storage
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

  // Clear  local storage
  const clearIngredients = () => {
    setIngredientsList([]);
    setIngredientsID([]);
    setRecipeName('');
    setNumberOfServings('');
    localStorage.removeItem('ingredientsList');
    localStorage.removeItem('ingredientsID');
    localStorage.removeItem('recipeName');
    localStorage.removeItem('numOfServings');
  };

  // TODO
  // implement remove function
  // const handleRemoveIngredient = (index) => {
  //   setIngredientsList(ingredientsList.filter((ingredient, i) => i !== index));
  // }

  const handleAddRecipe = async (req, res) => {
    const newRecipe = {
      recipeName: recipeName,
      ingredients: ingredientsID,
      servings: numberOfServings,
      user_id: userID,
    }
    try {
      // Create Recipe document
      const recipeResponse = await api.post('api/recipe', {
        json: newRecipe,
      });
      const recipeData = await recipeResponse.json();

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

  if (loading) return <div>Loading...</div>;
  if (logError) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-max p-6">
      <div className="flex flex-row items-center justify-between max-h-2 bg-gradient-to-r from-green-400 to-teal-500 px-6 pt-6 pb-9">
        <div>
          <h1>Recipes</h1>
        </div>
        <div>
          <PlusIcon className='w-7 h-7' onClick={handleAddRecipe} />
        </div>
      </div>
      <div>
        <label htmlFor="recipeName" className="sr-only">Recipe name</label>
        <input
          type="text"
          id="recipeName"
          name="recipeName"
          placeholder="Recipe name"
          aria-autocomplete=''
          value={recipeName}
          onChange={(e) => {
            const newValue = e.target.value;
            setRecipeName(newValue);
            localStorage.setItem('recipeName', newValue);
          }}
          required
          className="border p-2 rounded"
        />
      </div>
      <div>
        <label htmlFor="recipeServingSize" className="sr-only">Number of servings</label>
        <input
          type="text"
          id="recipeServingSize"
          name="recipeServingSize"
          placeholder="Number of servings"
          aria-autocomplete=''
          value={numberOfServings}
          onChange={(e) => {
            const newValue = e.target.value;
            setNumberOfServings(newValue);
            localStorage.setItem('numOfServings', newValue);
          }}
          required
          className="border p-2 rounded"
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
        {foodArray.map((food) => (
          <li key={food.food_id} className="py-2 ">
            <div className='rounded-md p-2 bg-teal-100'>
              <Link to={`/${sourcePage}/foodById/${food.food_id}`} className="text-blue-700 hover:underline">
                <strong>{food.food_name}</strong>
                <br />
                <span className='text-sm'>{food.food_description}</span>
                <br />
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <h3>Ingredients</h3>
      <ul>
        {ingredientsList.length > 0 ? (
          <li>
            {
              ingredientsList.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))
            }
          </li>
        ) : (
          <p>No ingredients found</p>
        )}
      </ul>
      <div>
        {/* Toaster to provide feedback to user */}
        <ToastContainer autoClose={500} />
      </div>
    </div>
  )
}

export default Recipe;
