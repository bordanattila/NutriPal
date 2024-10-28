import React, { useState } from 'react';
import ky from 'ky';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';


const api = ky.create({
    prefixUrl: 'http://localhost:3000',
});

const Search = () => {
    const [foodName, setFoodName] = useState('');
    const [foodArray, setFoodArray] = useState([]);
    const [error, setError] = useState(null);

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
        <div className="flex flex-col items-center justify-center min-h-max bg-gradient-to-br from-teal-200 via-cyan-300 to-blue-300 p-6">
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
                <div className='rounded-full p-2 bg-gray-200'>
                  <Link to={`/foodById/${food.food_id}`} className="text-blue-700 hover:underline">
                    <strong>{food.food_name}</strong>
                    <br />
                    Type: {food.food_type}
                    <br />
                  </Link>
                  </div>
                    URL: <a href={food.food_url} target="_blank" rel="noopener noreferrer">For detailed nutrition information click here</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      );

    // return (
    //     <div className="flex flex-col items-center justify-center min-h-max bg-gradient-to-br from-teal-200 via-cyan-300 to-blue-300 p-6">
    //         <form onSubmit={handleSearch} className="flex flex-wrap p-6 items-center justify-center mb-4">
    //             <div className="flex">
    //                 <label htmlFor="foodName" >Type in food manually</label>
    //                 </div>
    //             <div className="flex">
    //                 <input
    //                     type="text"
    //                     id="foodName"
    //                     value={foodName}
    //                     onChange={(e) => setFoodName(e.target.value)}
    //                     placeholder="Search"
    //                     className="border rounded py-2 px-4"
    //                 />
                
    //             <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">Search</button>
    //             {error && <div className="text-red-500 mt-2" style={{ color: 'red' }}>{error}</div>}
    //             </div>
    //             <div>
    //                 <label htmlFor="foodScan" >Scan barcode to be implemented</label>
    //                 <input
    //                     type="text"
    //                     id="foodScan"
    //                     value={foodName}
    //                     // onChange={(e) => setFoodName(e.target.value)}
    //                     placeholder="Scan"
    //                     className="border rounded py-2 px-4"
    //                 />
    //                 <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">Scan</button>
    //                 {error && <div className="text-red-500 mt-2" style={{ color: 'red' }}>{error}</div>}
    //                 </div>
    //         </form>
    //         {foodArray.length > 0 && (
    //             <ul className="list-none">
    //                 {foodArray.map((food) => (
    //                     <li key={food.food_id} className="py-2">
    //                         <Link to={`/foodById/${food.food_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
    //                             <strong>{food.food_name}</strong><br />
    //                             Type: {food.food_type}<br />
    //                             URL: <a href={food.food_url} target="_blank" rel="noopener noreferrer">For detailed nutrition information click here</a>
    //                         </Link>
    //                     </li>
    //                 ))}
    //                 <hr></hr>
    //             </ul>
    //         )}
    //     </div >
    // );

    // return (
    //     <form onSubmit={handleSearch} className="flex items-center border rounded-md px-3 py-2">
    //     <svg
    //       xmlns="http://www.w3.org/2000/svg"
    //       className="h-5 w-5 text-gray-400"
    //       viewBox="0 0 20 20"
    //       fill="none"
    //       stroke="currentColor"
    //       strokeWidth="2"
    //     >
    //       <path
    //         d="M21 21l-4.35-4.35"
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //       />
    //       <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round" />
    //     </svg>
    //     <input
    //       type="text"
    //       placeholder="Search for a food"
    //       className="w-full ml-3 focus:outline-none"
    //       value={foodName}
    //       onChange={(e) => setFoodName(e.target.value)}
    //     />
    //     <button
    //       type="submit"
    //       className="ml-auto p-2 rounded-md hover:bg-gray-100"
    //     >
    //       <svg
    //         xmlns="http://www.w3.org/2000/svg"
    //         className="h-5 w-5 text-gray-400"
    //         viewBox="0 0 20 20"
    //         fill="none"
    //         stroke="currentColor"
    //         strokeWidth="2"
    //       >
    //         <path
    //           d="M10 14l2-2m0 0l2-2m-2 2l-2 2"
    //           strokeLinecap="round"
    //           strokeLinejoin="round"
    //         />
    //       </svg>
    //     </button>
    //     </form>
    // )
};

export default Search;
