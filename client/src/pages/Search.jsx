import React, { useEffect, useState } from 'react';
import ky from 'ky';
import { useNavigate, Link } from 'react-router-dom';
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import useAuth from '../hooks/RefreshToken';
import SearchBar from '../components/SearchBar';
import { handleSearch } from '../components/SearchComponent';

const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});

const Search = () => {
  useAuth();
  const [foodName, setFoodName] = useState('');
  const [arrayToDisplay, setArrayToDisplay] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [logHistory, setLogHistory] = useState([]);
  const [barcodeID, setBarcodeID] = useState('');

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

  // Identify source page for FoodDetails.jsx
  const sourcePage = 'search';

  // Get the last 5 food logs for the user
  const userId = data?.user?._id;
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

  useEffect(() => {
    if (barcodeID !== '') {
      navigate(`/${sourcePage}/foodById/${barcodeID}`);
    }
  }, [barcodeID, navigate, sourcePage]);


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
