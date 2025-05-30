/**
 * @file DailyLogs.jsx
 * @description Displays the user's daily food log by date, grouped by meal type. Allows deletion of individual items.
 */

import React, { useEffect, useState } from 'react';
import ky from 'ky';
import { useNavigate, Link } from "react-router-dom";
import Auth from '../../../../packages/hared/src/utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../../../../packages/hared/src/utils/mutations';
import useAuth from '../../../../hooks/RefreshToken';
import Calendar from '../components/Calendar';
import { DateTime } from 'luxon';

/**
 * @constant api
 * @description Pre-configured ky instance for making API requests with a base prefix URL.
 */
const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});

/**
 * @component DailyLogs
 * @description React component for displaying the user's food logs for a selected date, with deletion support.
 * @returns {JSX.Element}
 */
const DailyLogs = () => {
  useAuth(); // Automatically refresh token if needed

  const navigate = useNavigate();

  /** @state {Array} logHistory - List of food items logged on the selected date */
  const [logHistory, setLogHistory] = useState([]);

  /** @state {string} logMessage - Fallback message when no logs are found */
  const [logMessage, setLogMessage] = useState('');

  /** @state {DateTime} date - The currently selected date (Luxon DateTime) */
  const [date, setDate] = useState(DateTime.now());

  /** @description Fetch current user data via GraphQL (used for userId) */
  const { loading, data, logError } = useQuery(GET_USER, {
    context: {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    },
    onError: () => {
      navigate('/login');
    }
  });

  const userId = data?.user?._id;

  /**
   * @function useEffect
   * @description Fetches the food logs for the selected date when date or userId changes.
   */
  useEffect(() => {
    const fetchLogHistory = async () => {
      try {
        // Ensure 'date' is a Luxon DateTime.
        const luxonDate = DateTime.isDateTime(date) ? date : DateTime.fromJSDate(date);
        const formattedDate = luxonDate.toFormat('yyyy-MM-dd'); // Format date for URL
        const response = await api.get(`api/foodByDate/${userId}/date/${formattedDate}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const responseData = await response.json();
        // Check if foods exist; if not, use an empty array.
        // If foods exists, update logHistory; otherwise, display message
        if (responseData.foods) {
          setLogHistory(responseData.foods);
          setLogMessage('');
        } else if (responseData.message) {
          setLogHistory([]);
          setLogMessage(responseData.message);
        }
      } catch (error) {
        console.error('Error fetching food logs for selected date:', error);
      }
    };

    if (userId) fetchLogHistory();
  }, [date, userId]);

  /**
   * @constant mealTypeOrder
   * @description Controls the order in which meal groups appear
   */
  const mealTypeOrder = ["breakfast", "lunch", "dinner", "snack"]

  /**
   * @constant groupedLogs
   * @description Groups food logs by meal_type for display
   */
  const groupedLogs = mealTypeOrder.map(mealType => ({
    mealType,
    foods: logHistory.filter(food => food.meal_type === mealType),
  }));

  /**
   * @function handleDelete
   * @description Handles deleting a food item from the daily log.
   * @param {string} food_id - ID of the food item to delete
   */
  const handleDelete = async (food_id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this food item?');
    if (confirmDelete) {
      try {
        const luxonDate = DateTime.isDateTime(date) ? date : DateTime.fromJSDate(date);
        const formattedDate = luxonDate.toFormat('yyyy-MM-dd');
        const response = await api.delete(`api/deleteFood/${userId}/${food_id}/${formattedDate}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // const newLogHistory = fetchLogHistory();
        const newLogHistory = logHistory.filter(food => food._id !== food_id);
        setLogHistory(newLogHistory);
      } catch (error) {
        console.error('Error deleting food:', error);
      }
    }
  };

  // Loading and error handling
  if (loading) return <div>Loading...</div>;
  if (logError) return <div>Error: {logError.message}</div>;

  // UI: Render calendar, grouped logs, or fallback message
  return (
    <div className="flex flex-col items-center justify-center min-h-max p-2">
      <h1 className="text-xl font-bold mb-4">Daily Log</h1>
      <div className="p-1 max-w-2xl mx-auto">
        <Calendar
          value={date}
          onChange={setDate}
        />
      </div>
      <div className="flex flex-col items-center justify-center w-full p-2">
        {logHistory.length > 0 ? (
          <>
            {groupedLogs.map(group => (
              <div key={group.mealType} className="flex flex-col items-center justify-center w-full p-2">
                {group.foods.length > 0 && (
                  <>
                    <h2 className="text-xl font-bold mb-4 capitalize">{group.mealType}</h2>
                    <ul className="list-none mt-4 w-full max-w-lg">
                      {group.foods.map(food => (
                        <li key={food.food_id} className="py-2 ">
                          <div className="relative rounded-md p-2 bg-teal-100">
                            <Link to={`/foodById/${food.food_id}`} className="text-blue-700 hover:underline pr-10 block">
                              <strong>{food.food_name}</strong>
                              <span className={`${food.brand ? 'visible' : 'invisible'}`}>({food.brand})</span>
                              <br />
                              <span className='text-sm'>
                                Calories: {(food.calories.toFixed(2))} | Carb: {(food.carbohydrate.toFixed(2))} | Protein: {(food.protein.toFixed(2))} | Fat: {(food.fat).toFixed(2)} | Number or servings: {food.number_of_servings} | Serving size: {food.serving_size}
                              </span>
                            </Link>
                            <button className='absolute right-2 top-1/2 -translate-y-1/2'
                              onClick={() => handleDelete(food._id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#f00" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </>
        ) : (
          <span>{logMessage}</span>
        )}
      </div>
    </div>
  );
};

export default DailyLogs;