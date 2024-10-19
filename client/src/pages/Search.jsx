import React, { useState } from 'react';
import ky from 'ky';
import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';

const Search = () => {
    const [foodName, setFoodName] = useState('');
    const [foodArray, setFoodArray] = useState([]);
    const [error, setError] = useState(null);
    // const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await ky.post('api/foodSearch/searchFoodByName', {
                json: { foodName },
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const data = await response.json();
            setFoodArray(data);
        } catch (error) {
            setError(error.message);
            console.error(`Error: ${error.message}`);
            alert(`Entry failed: ${error.message}`);
            // Send error report to server
            fetch('/error-report', { method: 'POST', body: JSON.stringify(error) });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    id="foodName"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="Search"
                />
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">Search</button>
                {error && <div style={{ color: 'red' }}>{error}</div>}
            </form>
            {foodArray.length > 0 && (
                <ul>
                    {foodArray.map((food, index) => (
                        <li key={index}>
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
