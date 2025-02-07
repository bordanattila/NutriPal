import React, { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import ky from 'ky';
import { useNavigate, Link } from 'react-router-dom';
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import useAuth from '../hooks/RefreshToken';

const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});

const Recipe = () => {
  useAuth();
  const [recipeName, setRecipeName] = useState('');
  const [foodName, setFoodName] = useState('');
  const [foodArray, setFoodArray] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  if (loading) return <div>Loading...</div>;
  if (logError) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-max p-6">
      <h1>Recipes</h1>
      <div>
        <label htmlFor="recipeName" className="sr-only">Recipe name</label>
        <input
          type="text"
          id="recipeName"
          name="recipeName"
          placeholder="Recipe name"
          aria-autocomplete=''
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          required
          className="border p-2 rounded"
        />
      </div>
      <SearchBar
        nameOfFood={foodName}
        setNameOfFood={setFoodName}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
        error={error}
      />
      {/* Search Results */}
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
    </div>
  )
}

export default Recipe;
