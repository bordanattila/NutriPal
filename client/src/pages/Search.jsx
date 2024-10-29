import React, { useState } from 'react';
import ky from 'ky';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import Auth from '../utils/auth';


const api = ky.create({
    prefixUrl: 'http://localhost:3000',
});

const Search = () => {
    const [foodName, setFoodName] = useState('');
    const [foodArray, setFoodArray] = useState([]);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(true);

    // Refresh token on component mount
    // useEffect(() => {
    //   const refreshAccessToken = async () => {
    //     const isTokenRefreshed = await Auth.refreshToken();
    //     if (!isTokenRefreshed) {
    //       navigate('/login'); 
    //     }
    //     setIsRefreshing(false); 
    //   };
  
    //   refreshAccessToken();
    // }, [navigate]);

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

    return (
        <div className="flex flex-col items-center justify-center min-h-max p-6">
          <form onSubmit={handleSearch} className="flex flex-col p-6 items-center justify-center mb-4 w-full max-w-lg">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
              <input
                type="text"
                id="foodName"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="Search for a food"
                className="w-full pl-10 pr-10 py-2 rounded-full bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
              />
              {/* Clear Button */}
              {foodName && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon />
                </button>
              )}
            </div>
            {/* Submit search button */}
            <button
              className="mt-4 bg-gradient-to-r from-green-400 to-teal-500 rounded-full shadow-lg hover:from-green-400 hover:to-blue-600 transition duration-300 text-white font-bold py-2 px-6 "
              type="submit"
            >
              Search
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </form>
    
          {/* Search Results */}
          {foodArray.length > 0 && (
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
          )}
        </div>
      );
};

export default Search;
