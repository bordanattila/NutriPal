/**
 * @file SavedRecipes.jsx
 * @module SavedRecipes
 * @description Displays the list of recipes saved by the user and allows logging a recipe.
 */

import React, { useEffect, useState } from "react";
import ky from 'ky';
import Auth from '../../../../packages/hared/src/utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../../../../packages/hared/src/utils/mutations';
import useAuth from '../../../../hooks/RefreshToken';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/20/solid';

// Create a pre-configured Ky instance with API prefix and credentials
const api = ky.create({
    prefixUrl: process.env.REACT_APP_API_URL,
    credentials: 'include',
});

/**
 * SavedRecipes component displays saved user recipes and allows logging them.
 * @returns {JSX.Element} The rendered component
 */
const SavedRecipes = () => {
    useAuth();  // Refresh token if needed

    const [recipeArray, setRecipeArray] = useState([]);// Store user's saved recipes
    const navigate = useNavigate();

    // Apollo query to fetch current user data
    const { loading, data, error } = useQuery(GET_USER, {
        context: {
            headers: {
                Authorization: `Bearer ${Auth.getToken()}`,
            },
        },
        onError: () => {
            navigate('/'); // Redirect if unauthorized or error occurs
        }
    });

    const userId = data?.user?._id;

    // Fetch saved recipes when userId becomes available
    useEffect(() => {
        if (!userId) return;
        const fetchRecipes = async () => {
            try {
                const response = await api.get(`api/saved-recipes/${userId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setRecipeArray(data);
            } catch (error) {
                console.error('Failed to fetch saved recipes:', error);
            }

        };
        fetchRecipes();
    }, [userId]);

    /**
     * Handle click on a saved recipe to log it.
     * @param {number} index - Index of the selected recipe in the array
     */
    const handleAddRecipeToLog = (index) => {
        const selectedRecipeID = (recipeArray[index]._id)
        const selectedRecipeName = (recipeArray[index].recipeName)

        // Navigate to the log screen for that specific recipe
        navigate(`/log-recipe/${selectedRecipeName}/${selectedRecipeID}`);
    };

    if (loading || !data || !data.user) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="flex flex-col items-center justify-center min-h-max p-6">
            <h2 className='text-2xl font-bold text-teal-700 tracking-wide uppercase mb-4 border-b-2 border-teal-400 pb-2 shadow-sm text-center'>Saved Recipes</h2>
            <ul className="list-none mt-4 w-full max-w-lg">
                {recipeArray.map((recipe, index) => (
                    <div className='relative rounded-md p-2 m-2 bg-teal-100'>
                        <li className="text-blue-700">
                            <strong>{recipe.recipeName}</strong>
                            <p className="text-md font-bold">Nutrition information per serving</p>
                            <span className="text-sm text-gray-700">Calories: {(recipe.nutrition.caloriesPerServing).toFixed(2)} | Carb: {(recipe.nutrition.carbohydratePerServing).toFixed(2)} | Protein: {(recipe.nutrition.proteinPerServing).toFixed(2)} | Fat: {(recipe.nutrition.fatPerServing).toFixed(2)}</span>
                        </li>
                        <button className='absolute right-2 top-1/2 -translate-y-1/2'
                            onClick={() => handleAddRecipeToLog(index)}
                        >
                            <PlusIcon className='w-7 h-7' />
                        </button>
                    </div>
                ))}
            </ul>
        </div>
    );
}

export default SavedRecipes;