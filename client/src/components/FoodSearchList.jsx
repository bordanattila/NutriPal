import React, { useState } from 'react';
import SearchBar from './SearchBar';
import { handleSearch } from './SearchComponent';

export default function FoodSearchList({ onPick }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleSearch({
        name: query,
        setArray: setResults,
        setError,
        setBarcode: () => { },
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <SearchBar
        nameOfFood={query}
        setNameOfFood={setQuery}
        handleSearch={handleSubmit}
        clearSearch={clearResults}
        error={error}
      />
      <ul className="list-none mt-4 w-full mx-auto">
        {results.map((food) => (
          <li key={food.food_id} className="py-2">
            <button
              onClick={() => onPick(food)}
              className="block w-full text-left rounded-md p-2 m-2 bg-teal-100 hover:bg-teal-200 transition"
            >
              <strong className="text-blue-700">{food.food_name}</strong>{' '}
              <span className={food.brand_name ? 'text-sm text-gray-600' : 'invisible'}>
                ({food.brand_name})
              </span>
              {food.food_description && (
                <p className="text-sm text-gray-700 mt-1">
                  {food.food_description}
                </p>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}