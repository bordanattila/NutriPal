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
        setBarcode: () => {},
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
    <div>
      <SearchBar
        nameOfFood={query}
        setNameOfFood={setQuery}
        handleSearch={handleSubmit}
        clearSearch={clearResults}
        error={error}
      />
      <ul className="list-none mt-4 w-full max-w-lg">
        {results.map((food) => (
          <li key={food.food_id} className="py-2">
            <button
              onClick={() => onPick(food)}
              className="w-full text-left rounded-md p-2 bg-teal-100 hover:bg-teal-200 transition"
            >
              <strong>{food.food_name}</strong>{' '}
              <span className="brandVisibility">({food.brand_name})</span>
              <br />
              <span className="text-sm">{food.food_description}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}