import React, { useEffect, useState } from 'react';
import ky from 'ky';
import { useNavigate, Link } from "react-router-dom";
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import useAuth from '../hooks/RefreshToken';
import Calendar from '../components/Calendar';
import dayjs from 'dayjs'; 


const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});

const DailyLogs = () => {
  useAuth();
  const navigate = useNavigate();
  const [logHistory, setLogHistory] = useState([]);
  const [date, setDate] = useState(new Date());

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

  // Get the food items logged today

  const userId = data?.user?._id;

  useEffect(() => {
    const fetchLogHistory = async () => {
      try {
        const formattedDate = dayjs(date).format('YYYY-MM-DD'); // Format date for URL
        const response = await api.get(`api/foodByDate/${userId}/date/${formattedDate}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setLogHistory(data);
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
                          <strong>{food.food_name}</strong>
                          <br />
                          <span className="text-sm">
                            {food.serving_size} | Calories: {food.calories} | Carb: {food.carbohydrate} | Protein: {food.protein} | Fat: {food.fat}
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
      </div>
    </div>
  );
};

export default DailyLogs;