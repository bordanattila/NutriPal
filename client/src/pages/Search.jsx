import React, { useState } from 'react';
import ky from 'ky';
import { useNavigate } from 'react-router-dom';

const Search = () => {
    const [foodName, setFoodName] = useState('');
    const [foodArray, setFoodArray] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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
        <div>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    id="foodName"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="Search"
                />
                <button type="submit">Search</button>
                {error && <div style={{ color: 'red' }}>{error}</div>}
            </form>
            {foodArray.length > 0 && (
                <ul>
                    {foodArray.map((food, index) => (
                        <li key={index}>
                            <strong>{food.food_name}</strong><br />
                            Type: {food.food_type}<br />
                            URL: <a href={food.food_url} target="_blank" rel="noopener noreferrer">{food.food_url}</a>
                        </li>
                    ))}
                </ul>
            )}
        </div >
    );
};

export default Search;
