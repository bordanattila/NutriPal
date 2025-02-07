import React, { useEffect, useState } from 'react';
import ky from 'ky';
import { useNavigate, Link } from 'react-router-dom';
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import useAuth from '../hooks/RefreshToken';
import SearchBar from '../components/SearchBar';

const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});

const Search = () => {
  useAuth();
  const [foodName, setFoodName] = useState('');
  const [foodArray, setFoodArray] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [logHistory, setLogHistory] = useState([]);

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

  const userId = data.user._id;

  useEffect(() => {
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
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get(`api/foodByName?searchExpression=${foodName}`);
      const data = await response.json();
      setFoodArray(data.foods.food);
      setError(null);

    } catch (error) {
      setError(error.message);
      console.error(`Error: ${error.message}`);
      alert(`Entry failed: ${error.message}`);
      // Send error report to server
      fetch('/error-report', { method: 'POST', body: JSON.stringify(error) });
    }
  };



  const clearSearch = () => {
    setFoodName('');
    setFoodArray([]);
  };


  console.log("this is the logHistory");
  console.log(logHistory);

  if (loading) return <div>Loading...</div>;
  if (logError) return <div>Error: {error.message}</div>;

  
  return (
    <div className="flex flex-col items-center justify-center min-h-max p-6">

      <SearchBar
        nameOfFood={foodName}
        setNameOfFood={setFoodName}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
        error={error}
      />

      {/* Search Results */}
      {foodArray.length > 0 ? (
        <ul className="list-none mt-4 w-full max-w-lg">
          {foodArray.map((food) => (
            <li key={food.food_id} className="py-2 ">
              <div className='rounded-md p-2 bg-teal-100'>
                <Link to={`/foodById/${food.food_id}`} className="text-blue-700 hover:underline">
                  <strong>{food.food_name}</strong>
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
          <h2 className='text-center'>Recent History</h2>
          <ul className="list-none mt-4 w-full max-w-lg">
            {logHistory.map((food) => (
              <li key={food.food_id} className="py-2">
                <div className="rounded-md p-2 bg-teal-100">
                  <Link to={`/foodById/${food.food_id}`} className="text-blue-700 hover:underline">
                    <strong>{food.food_name}</strong>
                    <br />
                    <span className='text-sm'>
                      Calories: {food.calories} | Carb: {food.carbohydrate} | Protein: {food.protein} | Fat: {food.fat} | Number or servings: {food.number_of_servings} | Serving size: {food.serving_size}
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
