/**
 * @file Dashboard.jsx
 * @description Displays a dashboard with daily nutrition statistics using charts and summaries. Fetches today's food logs from the backend API.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import Auth from '@nutripal/shared/src/utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '@nutripal/shared/src/utils/mutations';
import DonutChart from '../components/Donut';
import useAuth from '@nutripal/shared/src/hooks/RefreshToken';
import api from '@nutripal/shared/src/utils/api';
import { DateTime } from "luxon";

/**
 * @component Dashboard
 * @description Main dashboard component for logged-in users. Displays nutrition totals and visual summaries.
 * @returns {JSX.Element}
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Validate token and refresh if needed
  useAuth();
  // State: raw log data and totals
  const [todaysLog, setTodaysLog] = useState([]);
  const [calorieTotal, setCalorieTotal] = useState(0);
  const [carbTotal, setCarbTotal] = useState(0);
  const [proteinTotal, setProteinTotal] = useState(0);
  const [fatTotal, setFatTotal] = useState(0);
  const [fiberTotal, setFiberTotal] = useState(0);
  const [sodiumTotal, setSodiumTotal] = useState(0);
  const [saturatedFatTotal, setSaturatedFatTotal] = useState(0);
  const [goal, setGoal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * @description Query current user using JWT in headers
   */
  const { loading, data, error } = useQuery(GET_USER, {
    context: {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    },
    onError: (err) => {
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

  /**
   * @function fetchTodaysLog
   * @description Fetches today's food log for the user.
   */
  const fetchTodaysLog = useCallback(async () => {
      if (!userId) return;
    // Calculate today's date fresh each time to ensure it's current
    const todaysDate = DateTime.now().setZone('America/New_York').toFormat('yyyy-MM-dd');
    console.log('🔄 Dashboard: Fetching food for date:', todaysDate);
      try {
        const response = await api.get(`api/foodByDate/${userId}/date/${todaysDate}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
      console.log('📊 Dashboard: Received foods:', data.foods?.length || 0);
      setTodaysLog(data.foods || []);
      } catch (error) {
        console.error('Error fetching todays foods:', error);
      setTodaysLog([]);
      }
  }, [userId]);

  /**
   * @function useEffect
   * @description Fetches today's food log and sets the daily goal.
   * Refreshes when navigating to the dashboard, when userId/calgoal changes, or on manual refresh.
   */
  useEffect(() => {
    setGoal(calgoal);
    fetchTodaysLog();
  }, [userId, calgoal, location.pathname, refreshKey, fetchTodaysLog]);

  /**
   * @function useEffect
   * @description Refresh data when the window regains focus or becomes visible.
   * Also sets up a periodic refresh every 30 seconds when on the dashboard.
   */
  useEffect(() => {
    const handleFocus = () => {
      // Only refresh if we're on the dashboard
      if (location.pathname === '/dashboard') {
        setRefreshKey(prev => prev + 1);
      }
    };

    const handleVisibilityChange = () => {
      // Refresh when tab becomes visible
      if (document.visibilityState === 'visible' && location.pathname === '/dashboard') {
        setRefreshKey(prev => prev + 1);
      }
    };

    // Set up periodic refresh every 30 seconds when on dashboard
    const interval = setInterval(() => {
      if (location.pathname === '/dashboard' && document.visibilityState === 'visible') {
        setRefreshKey(prev => prev + 1);
      }
    }, 30000); // 30 seconds

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [location.pathname]);

  /**
   * @function useEffect
   * @description Aggregates totals for calories and macros from today's logged foods.
   */
  useEffect(() => {
    const totalCalories = async () => {
      const totalCal = todaysLog?.reduce((sum, { calories = 0 }) => sum + calories, 0).toFixed(1) ?? 0;
      const totalCarb = todaysLog?.reduce((sum, { carbohydrate = 0 }) => sum + carbohydrate, 0).toFixed(1) ?? 0;
      const totalProtein = todaysLog?.reduce((sum, { protein = 0 }) => sum + protein, 0).toFixed(1) ?? 0;
      const totalFat = todaysLog?.reduce((sum, { fat = 0 }) => sum + fat, 0).toFixed(1) ?? 0;
      const totalSodium = todaysLog?.reduce((sum, { sodium = 0 }) => sum + sodium, 0).toFixed(1) ?? 0;
      const totalFiber = todaysLog?.reduce((sum, { fiber = 0 }) => sum + fiber, 0).toFixed(1) ?? 0;
      const totalSaturatedFat = todaysLog?.reduce((sum, { saturated_fat = 0 }) => sum + saturated_fat, 0).toFixed(1) ?? 0;
      setCalorieTotal(totalCal);
      setCarbTotal(totalCarb);
      setProteinTotal(totalProtein);
      setFatTotal(totalFat);
      setSodiumTotal(totalSodium);
      setFiberTotal(totalFiber);
      setSaturatedFatTotal(totalSaturatedFat);
    }
    totalCalories();
  }, [todaysLog]);

  /**
   * @constant stats
   * @description Macro nutrient stats for top section
   */
  const stats = [
    { name: 'Carb', value: carbTotal || 0 },
    { name: 'Protein', value: proteinTotal || 0 },
    { name: 'Fat', value: fatTotal || 0 },
    { name: 'Calories', value: calorieTotal || 0 },
  ]

  /**
   * @constant statsBottom
   * @description Supplementary stats for bottom section
   */
  const statsBottom = [
    { name: 'Sodium', value: sodiumTotal || 0 },
    { name: 'Fiber', value: fiberTotal || 0 },
    { name: 'Saturated Fat', value: saturatedFatTotal || 0 },

  ]

  // Handle loading and error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // UI rendering
  return (
    <>
      <h1 className="text-center text-4xl font-bold text-gray-800 mb-4">Dashboard</h1>

      <dl className="flex justify-center gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4 bg-gradient-to-br from-teal-200 via-cyan-300 to-blue-300 p-6">
        <div className="flex flex-row gap-5">
          {stats.map((stat) => (
            <div key={stat.name} >
              <dt className="text-sm text-gray-900">{stat.name}</dt>
              <dd className="text-xl font-semibold tracking-tight text-black">
                {typeof stat.value === 'number' ? stat.value.toFixed(1) : stat.value}
              </dd>
            </div>
          ))}
          <div>
            <dt className="text-sm text-gray-900">Calorie Goal</dt>
            <dd className="text-xl font-semibold tracking-tight text-black">{goal}</dd>
          </div>
        </div>
      </dl>
      <div className='flex justify-center'>
        <DonutChart stats={stats} />
      </div>
      <dl className="flex justify-center gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4 bg-gradient-to-br from-teal-200 via-cyan-300 to-blue-300 p-6">
        <div className="flex flex-row gap-5">
          {statsBottom.map((statsBottom) => (
            <div key={statsBottom.name} >
              <dt className="text-sm text-gray-900">{statsBottom.name}</dt>
              <dd className="text-xl font-semibold tracking-tight text-black">
                {typeof statsBottom.value === 'number' ? statsBottom.value.toFixed(1) : statsBottom.value}
              </dd>
            </div>
          ))}
        </div>
      </dl>
    </>
  );
};

export default Dashboard;
