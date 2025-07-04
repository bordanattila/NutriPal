/**
 * @file FoodSearchList.jsx
 * @module FoodSearchList
 * @description
 *   A reusable React component that provides a search UI for querying foods.
 *   Utilizes the SearchBar and handleSearch utility to fetch results,
 *   then renders them as clickable cards. Invokes onPick callback when a food
 *   item is selected.
 *
 * @param {Function} onPick - Callback invoked with a selected food object.
 * @returns {JSX.Element} The search input and results list.
 */
import React, { useState } from 'react';
import SearchBar from './SearchBar';
import { handleSearch } from './SearchComponent';

export default function FoodSearchList({ onPick }) {
  // Controlled state for the search query
  const [query, setQuery] = useState('');
  // Array of returned search results
  const [results, setResults] = useState([]);
  // Error message if search fails
  const [error, setError] = useState(null);

  /**
   * Handle form submission: perform the search and update results or error
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // call shared search utility
      await handleSearch({
        name: query,
        setArray: setResults,
        setError,
        setBarcode: () => {}, // not used here
      });
    } catch (err) {
      // display error message
      setError(err.message);
    }
  };

  /**
   * Clear current search results and any errors
   */
  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Search input bar */}
      <SearchBar
        nameOfFood={query}
        setNameOfFood={setQuery}
        handleSearch={handleSubmit}
        clearSearch={clearResults}
        error={error}
      />

      {/* Render list of search results */}
      <ul className="list-none mt-4 w-full mx-auto">
        {results.map((food) => (
          <li key={food.food_id} className="py-2">
            {/* Each result is a button-styled card */}
            <button
              onClick={() => onPick(food)}
              className="block w-full text-left rounded-md p-2 m-2 bg-teal-100 hover:bg-teal-200 transition"
            >
              {/* Food name and optional brand */}
              <strong className="text-blue-700">{food.food_name}</strong>{' '}
              <span className={food.brand_name ? 'text-sm text-gray-600' : 'invisible'}>
                ({food.brand_name})
              </span>

              {/* Optional description displayed below */}
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
