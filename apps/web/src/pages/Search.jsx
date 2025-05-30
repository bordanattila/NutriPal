/**
 * @file Search.jsx
 * @description Search page where users can look up food items by name or barcode, and view their recent food log history.
 */

import React, { useEffect, useState } from 'react';
import ky from 'ky';
import { useNavigate, Link } from 'react-router-dom';
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import useAuth from '../hooks/RefreshToken';
import SearchBar from '../components/SearchBar';
import { handleSearch } from '../components/SearchComponent';

/**
 * @constant api
 * @description Preconfigured ky instance for making API requests with a set prefix URL.
 */
const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});

/**
 * @component Search
 * @description Displays a food search bar and user's recent food history. Supports searching by name and barcode.
 * @returns {JSX.Element}
 */
const Search = () => {
  useAuth(); // Refresh access token if expired
  const [foodName, setFoodName] = useState('');
  const [arrayToDisplay, setArrayToDisplay] = useState([]);
  const [error, setError] = useState(null);
  const [logHistory, setLogHistory] = useState([]);
  const [barcodeID, setBarcodeID] = useState('');
  const navigate = useNavigate();

  // Identify source page for FoodDetails.jsx
  const sourcePage = 'search';

  /**
   * @hook useQuery
   * @description Retrieves authenticated user info using GET_USER query
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

  // Get the last 5 food logs for the user
  const userId = data?.user?._id;
  
  /**
   * @function useEffect
   * @description Fetches the last 5 food log entries for the authenticated user.
   */
  useEffect(() => {
    if (!userId) return;
    const fetchLogHistory = async () => {
      try {
        const response = await api.get(`api/recent-foods/${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setLogHistory(data);
      } catch (error) {
        console.error('Error fetching recent foods:', error);
      }
    };

    fetchLogHistory();
  }, [userId]);

  /**
   * @function onSearchSubmit
   * @description Triggers a food search by name using handleSearch.
   * @param {React.FormEvent} e - Form submit event.
   */
  const onSearchSubmit = async (e) => {
    e.preventDefault();
    if (foodName === '') {
      setError('Please enter a food name');
      return;
    }
    await handleSearch({
      name: foodName,
      setArray: setArrayToDisplay,
      setError: setError,
      setBarcode: setBarcodeID,
    });
  };

  /**
   * @function useEffect
   * @description If a food is found via barcode, auto-navigate to its FoodDetails page.
   */
  useEffect(() => {
    if (barcodeID !== '') {
      navigate(`/${sourcePage}/foodById/${barcodeID}`);
    }
  }, [barcodeID, navigate, sourcePage]);

  /**
   * @function clearSearch
   * @description Clears the search input and result list.
   */
  const clearSearch = () => {
    setFoodName('');
    setArrayToDisplay([]);
  };

  if (loading || !data || !data.user) return <div>Loading...</div>;
  if (logError) return <div>Error: {error.message}</div>;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-max p-6">

      <SearchBar
        nameOfFood={foodName}
        setNameOfFood={setFoodName}
        handleSearch={onSearchSubmit}
        clearSearch={clearSearch}
        error={error}
      />

      {/* Search Results */}
      {arrayToDisplay.length > 0 ? (
        <ul className="list-none mt-4 w-full max-w-lg">
          {arrayToDisplay.map((food) => (
            <li key={food.food_id} className="py-2 ">
              <div className='rounded-md p-2 bg-teal-100'>
                <Link to={`/${sourcePage}/foodById/${food.food_id}`} className="text-blue-700 hover:underline">
                  <strong>{food.food_name}</strong> <span className={`${food.brand ? 'visible' : 'invisible'}`}>({food.brand_name})</span>
                  <br />
                  <span className='text-sm'>{food.food_description}</span>
                  <br />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <h2 className="text-2xl font-bold text-teal-700 tracking-wide uppercase mb-4 border-b-2 border-teal-400 pb-2 shadow-sm text-center">
            Recent History
          </h2>
          <ul className="list-none mt-4 w-full max-w-lg">
            {logHistory.map((food) => (
              <li key={food.food_id} className="py-2">
                <div className="rounded-md p-2 bg-teal-100">
                  <Link to={`/${sourcePage}/foodById/${food.food_id}`} className="text-blue-700 hover:underline">
                    <strong>{food.food_name}</strong> <span className={`${food.brand ? 'visible' : 'invisible'}`}>({food.brand})</span>
                    <br />
                    <span className='text-sm'>
                      Calories: {(food.calories.toFixed(1))} | Carb: {(food.carbohydrate.toFixed(1))} | Protein: {(food.protein.toFixed(1))} | Fat: {(food.fat).toFixed(1)} | Number or servings: {food.number_of_servings} | Serving size: {food.serving_size}
                    </span>
                    <br />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Search;
