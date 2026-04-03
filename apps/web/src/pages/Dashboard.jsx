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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OUNCES_PER_CUP = 8;
const DEFAULT_WATER_GOAL_CUPS = 12;
const MAX_WATER_OZ = 1000;
const WATER_PROGRESS_SEGMENTS = 12;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useAuth();

  const [todaysLog, setTodaysLog] = useState([]);
  const [calorieTotal, setCalorieTotal] = useState(0);
  const [carbTotal, setCarbTotal] = useState(0);
  const [proteinTotal, setProteinTotal] = useState(0);
  const [fatTotal, setFatTotal] = useState(0);
  const [fiberTotal, setFiberTotal] = useState(0);
  const [sodiumTotal, setSodiumTotal] = useState(0);
  const [saturatedFatTotal, setSaturatedFatTotal] = useState(0);
  const [goal, setGoal] = useState(0);

  // Canonical frontend state for water intake: ounces
  const [waterIntakeOz, setWaterIntakeOz] = useState(0);

  const [refreshKey, setRefreshKey] = useState(0);

  const { loading, data, error } = useQuery(GET_USER, {
    context: {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    },
    onError: (err) => {
      console.error(err);

      if (err.message.includes("Unauthorized")) {
        const refreshSuccess = Auth.refreshToken();
        if (!refreshSuccess) {
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    }
  });

  const userId = data?.user?._id;
  const calgoal = data?.user?.calorieGoal;

  const waterUnit = data?.user?.waterUnit || 'cups';

  // Canonical goal in oz; falls back to legacy cups field × 8
  const waterGoalOz =
    data?.user?.waterGoalOz ??
    ((data?.user?.waterGoal ?? DEFAULT_WATER_GOAL_CUPS) * OUNCES_PER_CUP);

  const formatDisplayValue = useCallback((value) => {
    return Number.isInteger(value) ? value : Number(value.toFixed(1));
  }, []);

  const ozToDisplay = useCallback((oz) => {
    const rawValue = waterUnit === 'oz' ? oz : oz / OUNCES_PER_CUP;
    return formatDisplayValue(rawValue);
  }, [waterUnit, formatDisplayValue]);

  const unitLabel = useCallback((value) => {
    if (waterUnit === 'oz') return 'oz';
    return value === 1 ? 'cup' : 'cups';
  }, [waterUnit]);

  const displayedWater = ozToDisplay(waterIntakeOz);
  const displayedGoal = ozToDisplay(waterGoalOz);

  // In cups mode: + means +1 cup = +8 oz
  // In oz mode: + means +1 oz
  const waterStepOz = waterUnit === 'oz' ? 1 : OUNCES_PER_CUP;

  const progressRatio = waterGoalOz > 0
    ? Math.min(waterIntakeOz / waterGoalOz, 1)
    : 0;

  const filledSegments = Math.round(progressRatio * WATER_PROGRESS_SEGMENTS);

  const fetchTodaysLog = useCallback(async () => {
    if (!userId) return;

    const todaysDate = DateTime.now()
      .setZone('America/New_York')
      .toFormat('yyyy-MM-dd');

    try {
      const response = await api.get(`api/foodByDate/${userId}/date/${todaysDate}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();

      setTodaysLog(responseData.foods || []);

      // Backend may still return waterCups
      const intakeOz =
        responseData.waterIntakeOz ??
        ((responseData.waterCups ?? 0) * OUNCES_PER_CUP);

      setWaterIntakeOz(intakeOz);
    } catch (fetchError) {
      console.error('Error fetching todays foods:', fetchError);
      setTodaysLog([]);
      setWaterIntakeOz(0);
    }
  }, [userId]);

  const saveWaterIntake = useCallback(async (nextOz, prevOz) => {
    if (!userId) return;

    try {
      const todaysDate = DateTime.now()
        .setZone('America/New_York')
        .toFormat('yyyy-MM-dd');

      const response = await api.put('api/water-intake', {
        json: {
          user_id: userId,
          date: todaysDate,
          // Current backend still uses cups
          waterCups: nextOz / OUNCES_PER_CUP,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (saveError) {
      console.error('Error saving water intake:', saveError);
      setWaterIntakeOz(prevOz);
      toast.error('Failed to save water intake.');
    }
  }, [userId]);

  const adjustWater = useCallback((direction) => {
    const prevOz = waterIntakeOz;
    const deltaOz = direction * waterStepOz;
    const nextOz = Math.max(0, Math.min(MAX_WATER_OZ, prevOz + deltaOz));

    if (nextOz === prevOz) return;

    setWaterIntakeOz(nextOz);
    saveWaterIntake(nextOz, prevOz);

    if (prevOz < waterGoalOz && nextOz >= waterGoalOz) {
      toast.success(
        `You hit your ${displayedGoal} ${unitLabel(displayedGoal)} water goal!`
      );
    }
  }, [waterIntakeOz, waterStepOz, saveWaterIntake, waterGoalOz, displayedGoal, unitLabel]);

  useEffect(() => {
    setGoal(calgoal);
    fetchTodaysLog();
  }, [userId, calgoal, location.pathname, refreshKey, fetchTodaysLog]);

  useEffect(() => {
    const handleFocus = () => {
      if (location.pathname === '/dashboard') {
        setRefreshKey((prev) => prev + 1);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && location.pathname === '/dashboard') {
        setRefreshKey((prev) => prev + 1);
      }
    };

    const interval = setInterval(() => {
      if (location.pathname === '/dashboard' && document.visibilityState === 'visible') {
        setRefreshKey((prev) => prev + 1);
      }
    }, 30000);

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [location.pathname]);

  useEffect(() => {
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
  }, [todaysLog]);

  const stats = [
    { name: 'Carb', value: carbTotal || 0 },
    { name: 'Protein', value: proteinTotal || 0 },
    { name: 'Fat', value: fatTotal || 0 },
    { name: 'Calories', value: calorieTotal || 0 },
  ];

  const statsBottom = [
    { name: 'Sodium', value: sodiumTotal || 0 },
    { name: 'Fiber', value: fiberTotal || 0 },
    { name: 'Saturated Fat', value: saturatedFatTotal || 0 },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <h1 className="text-center text-4xl font-bold text-gray-800 mb-4">Dashboard</h1>

      <dl className="flex justify-center gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4 bg-gradient-to-br from-teal-200 via-cyan-300 to-blue-300 p-6">
        <div className="flex flex-row gap-5">
          {stats.map((stat) => (
            <div key={stat.name}>
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
          {statsBottom.map((item) => (
            <div key={item.name}>
              <dt className="text-sm text-gray-900">{item.name}</dt>
              <dd className="text-xl font-semibold tracking-tight text-black">
                {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
              </dd>
            </div>
          ))}
        </div>
      </dl>

      <div className="flex flex-col items-center mt-8 mb-14 px-4 w-full max-w-md mx-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Water Intake</h2>

        <div className="flex items-center gap-5 mb-4">
          <button
            onClick={() => adjustWater(-1)}
            disabled={waterIntakeOz <= 0}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-teal-500 text-white text-2xl font-bold leading-none active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100"
            aria-label={waterUnit === 'oz' ? 'Remove one ounce' : 'Remove one cup'}
          >
            −
          </button>

          <span className="text-3xl font-semibold min-w-[7rem] text-center tabular-nums select-none whitespace-nowrap">
            {displayedWater} {unitLabel(displayedWater)}
          </span>

          <button
            onClick={() => adjustWater(1)}
            disabled={waterIntakeOz >= MAX_WATER_OZ}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-teal-500 text-white text-2xl font-bold leading-none active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100"
            aria-label={waterUnit === 'oz' ? 'Add one ounce' : 'Add one cup'}
          >
            +
          </button>
        </div>

        <div
          className="flex gap-1 w-full"
          role="progressbar"
          aria-valuenow={waterIntakeOz}
          aria-valuemin={0}
          aria-valuemax={waterGoalOz}
        >
          {Array.from({ length: WATER_PROGRESS_SEGMENTS }, (_, i) => (
            <div
              key={i}
              className={`h-3 flex-1 rounded-sm transition-colors ${
                i < filledSegments ? 'bg-teal-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <p className="text-sm text-gray-600 mt-1.5 tabular-nums">
          {displayedWater} / {displayedGoal} {unitLabel(displayedGoal)}
        </p>
      </div>

      <ToastContainer autoClose={2000} position="bottom-center" />
    </>
  );
};

export default Dashboard;