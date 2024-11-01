import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import DonutChart from '../components/Donut';
import useAuth from '../hooks/RefreshToken';
import ky from 'ky';

// const stats = [
//   { name: 'Carb', value: '120 g' },
//   { name: 'Protein', value: '80 g' },
//   { name: 'Fat', value: '36 g' },
//   { name: 'Calories', value: calorieTotal },
//   // { name: 'Goal', value: '2000' },
// ]

const api = ky.create({
  prefixUrl: 'http://localhost:3000',
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

  const { loading, data, error } = useQuery(GET_USER, {
    context: {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    },
    onError: (err) => {
           // Check if the error is due to an expired token
           if (err.message.includes("Unauthorized")) {
            // Attempt to refresh the token
            const refreshSuccess = Auth.refreshToken();
            if (!refreshSuccess) {
              navigate('/login');
            }
          } else {
            navigate('/login'); // For other errors, navigate to login
          }
    }
  });

  const userId = data?.user?._id;

  useEffect(() => {
    const fetchTodaysLog = async () => {
      if (!userId) return;
      try {
        const response = await api.get(`api/todays-foods/${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data)
        setTodaysLog(data);
      } catch (error) {
        console.error('Error fetching todays foods:', error);
      }
    };
    console.log(todaysLog)
    fetchTodaysLog();
  }, [userId]);

  useEffect(() => {
    const totalCalories = async () => {
      const totalCal = todaysLog.reduce((sum, item) => sum + (item.calories || 0), 0);
      const totalCarb = todaysLog.reduce((sum, item) => sum + (item.carbohydrate || 0), 0);
      const totalProtein = todaysLog.reduce((sum, item) => sum + (item.protein || 0), 0);
      const totalFat = todaysLog.reduce((sum, item) => sum + (item.fat || 0), 0);
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
    { name: 'Goal', value: '2000' },
  ]

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;


  // Render the dashboard page with the fetched username
  return (
    <>
      <h1 className="text-center text-4xl font-bold text-gray-800 mb-4">Dashboard</h1>

      <dl className="flex justify-center gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4 bg-gradient-to-br from-teal-200 via-cyan-300 to-blue-300 p-6">
        {stats.map((stat) => (
          <div key={stat.name} className="flex flex-col-reverse gap-1">
            <dt className="text-sm text-gray-900">{stat.name}</dt>
            <dd className="text-xl font-semibold tracking-tight text-black">
              {typeof stat.value === 'number' ? stat.value.toFixed(2) : stat.value}
            </dd>
          </div>
        ))}
      </dl>
      <div className='flex justify-center'>
        <DonutChart stats={stats} />
      </div>

    </>
  );
};

export default Dashboard;
