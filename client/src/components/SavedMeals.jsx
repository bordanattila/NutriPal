/**
 * @file SavedMeals.jsx
 * @module SavedMeals
 * @description Displays the list of meals saved by the user and allows logging a meal.
 */

import React, { useEffect, useState } from "react";
import api from '../utils/api';
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import useAuth from '../hooks/RefreshToken';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/20/solid';

/**
 * SavedMeals component displays saved user meals and allows logging them.
 * @returns {JSX.Element} The rendered component
 */
const SavedMeals = () => {
    useAuth();  // Refresh token if needed

    const [mealArray, setMealArray] = useState([]);// Store user's saved meals
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

    // Fetch saved meals when userId becomes available
    useEffect(() => {
        if (!userId) return;
        const fetchMeals = async () => {
            try {
                const response = await api.get(`api/saved-meals/${userId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setMealArray(data);
            } catch (error) {
                console.error('Failed to fetch saved meals:', error);
            }

        };
        fetchMeals();
    }, [userId]);

    /**
     * Handle click on a saved meal to log it.
     * @param {number} index - Index of the selected meal in the array
     */
    const handleAddMealToLog = (index) => {
        const selectedMealID = (mealArray[index]._id)   
        const selectedMealName = (mealArray[index].mealName)

        // Navigate to the log screen for that specific meal
        navigate(`/log-meal/${selectedMealName}/${selectedMealID}`);
    };

    if (loading || !data || !data.user) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="flex flex-col items-center justify-center min-h-max p-6">
            <h2 className='text-2xl font-bold text-teal-700 tracking-wide uppercase mb-4 border-b-2 border-teal-400 pb-2 shadow-sm text-center'>Saved Recipes</h2>
            <ul className="list-none mt-4 w-full max-w-lg">
                {mealArray.map((meal, index) => (
                    <div className='relative rounded-md p-2 m-2 bg-teal-100'>
                        <li className="text-blue-700">
                            <strong>{meal.mealName}</strong>
                            <p className="text-md font-bold">Nutrition information per serving</p>
                            <span className="text-sm text-gray-700">Calories: {(meal.nutrition.caloriesPerServing).toFixed(2)} | Carb: {(meal.nutrition.carbohydratePerServing).toFixed(2)} | Protein: {(meal.nutrition.proteinPerServing).toFixed(2)} | Fat: {(meal.nutrition.fatPerServing).toFixed(2)}</span>
                        </li>
                        <button className='absolute right-2 top-1/2 -translate-y-1/2'
                            onClick={() => handleAddMealToLog(index)}
                        >
                            <PlusIcon className='w-7 h-7' />
                        </button>
                    </div>
                ))}
            </ul>
        </div>
    );
}

export default SavedMeals;