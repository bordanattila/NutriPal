import React, { useEffect, useState } from 'react';
import ky from 'ky';
import { useNavigate, Link } from "react-router-dom";
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import useAuth from '../hooks/RefreshToken';
import Calendar from '../components/Calendar';
// TODO
// fix date selection
// implement remove function
import { DateTime } from 'luxon';


const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});

const DailyLogs = () => {
  useAuth();
  const navigate = useNavigate();
  const [logHistory, setLogHistory] = useState([]);
  const [logMessage, setLogMessage] = useState('');
  const [date, setDate] = useState(DateTime.now());

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

  // Get the food items logged today
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

  // Group logHistory by meal_type
  const mealTypeOrder = ["breakfast", "lunch", "dinner", "snack"]
  const groupedLogs = mealTypeOrder.map(mealType => ({
    mealType,
    foods: logHistory.filter(food => food.meal_type === mealType),
  }));

  if (loading) return <div>Loading...</div>;
  if (logError) return <div>Error: {logError.message}</div>;

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
                      <div className="rounded-md p-2 bg-teal-100">
                        <Link to={`/foodById/${food.food_id}`} className="text-blue-700 hover:underline">
                          <strong>{food.food_name}</strong> <span className='brandVisibility'>({food.brand})</span>
                          <br />
                          <span className="text-sm">
                            Calories: {food.calories} | Carb: {food.carbohydrate} | Protein: {food.protein} | Fat: {food.fat} | Number or servings: {food.number_of_servings} | Serving size: {food.serving_size}
                          </span>
                        </Link>
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