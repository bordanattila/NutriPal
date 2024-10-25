import React, { useState } from 'react';
import ky from 'ky';
import { Link } from 'react-router-dom';

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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-200 via-cyan-300 to-blue-300 p-6">
            <form onSubmit={handleSearch} className="mb-4">
                <input
                    type="text"
                    id="foodName"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="Search"
                    className="border rounded py-2 px-4"
                />
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">Search</button>
                {error && <div className="text-red-500 mt-2" style={{ color: 'red' }}>{error}</div>}
            </form>
            {foodArray.length > 0 && (
                <ul className="list-none">
                    {foodArray.map((food) => (
                        <li key={food.food_id} className="py-2">
                            <Link to={`/foodById/${food.food_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <strong>{food.food_name}</strong><br />
                                Type: {food.food_type}<br />
                                URL: <a href={food.food_url} target="_blank" rel="noopener noreferrer">For detailed nutrition information click here</a>
                            </Link>
                        </li>
                    ))}
                    <hr></hr>
                </ul>
            )}
        </div >
    );
};

export default Search;
