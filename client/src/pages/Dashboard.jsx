import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import DonutChart from '../components/Donut';
import useAuth from '../hooks/RefreshToken';
import ky from 'ky';
import { DateTime } from "luxon";

const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});

const Dashboard = () => {
  const navigate = useNavigate();
  // Validate token and refresh if needed
  useAuth();

  const [todaysLog, setTodaysLog] = useState([]);
  const [calorieTotal, setCalorieTotal] = useState(0);
  const [carbTotal, setCarbTotal] = useState(0);
  const [proteinTotal, setProteinTotal] = useState(0);
  const [fatTotal, setFatTotal] = useState(0);
  const [goal, setGoal] = useState(0);
  const [date, setDate] = useState(DateTime.now());
  
  const todaysDate = date.year+'-'+date.month+'-'+date.day

  const { loading, data, error } = useQuery(GET_USER, {
    context: {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    },
    onError: (err) => {
      setDate(DateTime.now())
      console.error(err); 
           // Check if the error is due to an expired token
           if (err.message.includes("Unauthorized")) {
            // Attempt to refresh the token
            const refreshSuccess = Auth.refreshToken();
            if (!refreshSuccess) {
              navigate('/login');
            }
          } else {
            // For other errors, navigate to login
            navigate('/login'); 
          }
    }
  });


  const userId = data?.user?._id;
  const calgoal = data?.user?.calorieGoal;
  
  useEffect(() => {
    const fetchTodaysLog = async () => {
      if (!userId) return;
      try {
        const response = await api.get(`api/foodByDate/${userId}/date/${todaysDate}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("response for dashboard", data)
        setTodaysLog(data.foods);
        console.log("dashboard", data)
      } catch (error) {
        console.error('Error fetching todays foods:', error);
      }
    };
    setGoal(calgoal)
    fetchTodaysLog();
  }, [userId, calgoal, todaysDate]);
console.log("today's log", todaysLog)
  useEffect(() => {
    const totalCalories = async () => {
      const totalCal = todaysLog?.reduce((sum, { calories = 0 }) => sum + calories, 0) ?? 0;
      const totalCarb = todaysLog?.reduce((sum, { carbohydrate = 0 }) => sum + carbohydrate, 0) ?? 0;
      const totalProtein = todaysLog?.reduce((sum, { protein = 0 }) => sum + protein, 0) ?? 0;
      const totalFat = todaysLog?.reduce((sum, { fat = 0 }) => sum + fat, 0) ?? 0;
      setCalorieTotal(totalCal);
      setCarbTotal(totalCarb);
      setProteinTotal(totalProtein);
      setFatTotal(totalFat);
    }
    totalCalories();
  }, [todaysLog]);

  const stats = [
    { name: 'Carb', value: carbTotal || 0 },
    { name: 'Protein', value: proteinTotal || 0 },
    { name: 'Fat', value: fatTotal || 0 },
    { name: 'Calories', value: calorieTotal || 0 },
  ]

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <h1 className="text-center text-4xl font-bold text-gray-800 mb-4">Dashboard</h1>

      <dl className="flex justify-center gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4 bg-gradient-to-br from-teal-200 via-cyan-300 to-blue-300 p-6">
      <div className="flex flex-row gap-5">
        {stats.map((stat) => (
          <div key={stat.name} >
            <dt className="text-sm text-gray-900">{stat.name}</dt>
            <dd className="text-xl font-semibold tracking-tight text-black">
              {typeof stat.value === 'number' ? stat.value.toFixed(2) : stat.value}
            </dd>
          </div>
        ))}
        <div>
        <dt className="text-sm text-gray-900">Goal</dt>
        <dd className="text-xl font-semibold tracking-tight text-black">{goal}</dd>
        </div>
        </div>
      </dl>
      <div className='flex justify-center'>
        <DonutChart stats={stats} />
      </div>

    </>
  );
};

export default Dashboard;
