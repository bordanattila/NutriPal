import React from "react";
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';

const SearchBar = ({nameOfFood, setNameOfFood, handleSearch, clearSearch, error}) => {       
    return (        
        <form onSubmit={handleSearch} className="flex flex-col p-6 items-center justify-center mb-4 w-full max-w-lg">
        <div className="relative w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
          <input
            type="text"
            id="foodName"
            value={nameOfFood}
            onChange={(e) => setNameOfFood(e.target.value)}
            placeholder="Search for a food"
            className="w-full pl-10 pr-10 py-2 rounded-full bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
          />
          {/* Clear Button */}
          {nameOfFood && (
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

);
};

export default SearchBar;