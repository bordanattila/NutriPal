import React, { useEffect, useState } from "react";
import ky from 'ky';
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import useAuth from '../hooks/RefreshToken';
import { useNavigate, Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/20/solid';

const api = ky.create({
    prefixUrl: process.env.REACT_APP_API_URL,
    credentials: 'include',
});

const SavedRecipes = () => {
    useAuth();
    const [recipeArray, setRecipeArray] = useState([]);
    const navigate = useNavigate();
    const { loading, data, error } = useQuery(GET_USER, {
        context: {
            headers: {
                Authorization: `Bearer ${Auth.getToken()}`,
            },
        },
        onError: () => {
            navigate('/');
        }
    });

    const userId = data?.user?._id;
    useEffect(() => {
        if (!userId) return;
        const fetchRecipes = async () => {
            try {
                const response = await api.get(`api/saved-recipes/${userId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                console.log("recipe response", response)
                const data = await response.json();
                console.log(data);
                setRecipeArray(data);
                console.log(recipeArray);
            } catch (error) {
                console.error('Failed to fetch saved recipes:', error);
            }

        };
        fetchRecipes();
    }, [userId, data, recipeArray]);

    const handleAddRecipeToLog = (index) => (
        console.log("Recipe log", index)
        );


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