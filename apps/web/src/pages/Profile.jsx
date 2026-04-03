/**
 * @file Profile.jsx
 * @description Allows users to update their profile information, including calorie goal, water goal/unit, password, and profile picture.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import Auth from '@nutripal/shared/src/utils/auth';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER, UPDATE_USER_PROFILE } from '@nutripal/shared/src/utils/mutations';

const OUNCES_PER_CUP = 8;

const Profile = () => {
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [calorieGoal, setCalorieGoal] = useState('');
  const [waterGoalInput, setWaterGoalInput] = useState('');
  const [waterUnit, setWaterUnit] = useState('cups');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');

  const { loading: loadingQuery, data, error: queryError } = useQuery(GET_USER, {
    context: {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    },
    onError: (err) => {
      setLoading(false);
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

  const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE);

  const formatDisplayGoal = (goalOz, unit) => {
    if (goalOz === undefined || goalOz === null || Number.isNaN(Number(goalOz))) {
      return '';
    }

    const numericGoal = Number(goalOz);
    const displayValue = unit === 'oz'
      ? numericGoal
      : numericGoal / OUNCES_PER_CUP;

    return Number.isInteger(displayValue)
      ? String(displayValue)
      : String(Number(displayValue.toFixed(2)));
  };

  const toOz = (inputValue, unit) => {
    const numericValue = Number(inputValue);

    if (Number.isNaN(numericValue) || numericValue <= 0) {
      return null;
    }

    return unit === 'oz'
      ? Math.round(numericValue)
      : Math.round(numericValue * OUNCES_PER_CUP);
  };

  useEffect(() => {
    if (!data?.user) return;

    const currentUser = data.user;

    setUser(currentUser);
    setCalorieGoal(currentUser.calorieGoal ?? '');
    setWaterUnit(currentUser.waterUnit || 'cups');
    const goalOz = currentUser.waterGoalOz ?? ((currentUser.waterGoal ?? 12) * OUNCES_PER_CUP);
    setWaterGoalInput(
      formatDisplayGoal(goalOz, currentUser.waterUnit || 'cups')
    );

    setProtein(currentUser.macros?.protein ?? '');
    setFat(currentUser.macros?.fat ?? '');
    setCarbs(currentUser.macros?.carbs ?? '');
  }, [data]);

  const waterGoalLabel = useMemo(() => {
    return waterUnit === 'oz' ? 'Water Goal (oz/day)' : 'Water Goal (cups/day)';
  }, [waterUnit]);

  const waterGoalPlaceholder = useMemo(() => {
    return waterUnit === 'oz'
      ? 'Water Goal in ounces'
      : 'Water Goal in cups';
  }, [waterUnit]);

  const handleWaterUnitChange = (nextUnit) => {
    if (nextUnit === waterUnit) return;

    const currentValue = Number(waterGoalInput);

    if (!Number.isNaN(currentValue) && waterGoalInput !== '') {
      const convertedValue = nextUnit === 'oz'
        ? currentValue * OUNCES_PER_CUP
        : currentValue / OUNCES_PER_CUP;

      setWaterGoalInput(
        Number.isInteger(convertedValue)
          ? String(convertedValue)
          : String(Number(convertedValue.toFixed(2)))
      );
    }

    setWaterUnit(nextUnit);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userId = data.user._id;
      const variables = { userId };

      if (calorieGoal !== '') variables.calorieGoal = parseInt(calorieGoal, 10);

      if (waterGoalInput !== '') {
        const goalOz = toOz(waterGoalInput, waterUnit);

        if (goalOz === null) {
          setError('Please enter a valid water goal greater than 0.');
          setLoading(false);
          return;
        }

        variables.waterGoalOz = goalOz;
      }

      variables.waterUnit = waterUnit;

      if (password) variables.password = password;
      if (profilePic) variables.profilePic = profilePic;

      if (protein || fat || carbs) {
        variables.macros = {
          ...(protein && { protein: parseInt(protein, 10) }),
          ...(fat && { fat: parseInt(fat, 10) }),
          ...(carbs && { carbs: parseInt(carbs, 10) }),
        };
      }

      const { data: responseData } = await updateUserProfile({ variables });

      setUser(responseData.updateUserProfile);
      navigate('/dashboard');
    } catch (updateErr) {
      setError(updateErr.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    setProfilePic(e.target.files[0]);
  };

  if (loadingQuery) return <div>Loading...</div>;
  if (queryError) return <div>Error: {queryError.message}</div>;

  return (
    <div className="flex flex-col h-dvh">
      <h1 className="text-center">Profile</h1>

      <form onSubmit={handleUpdate} className="flex flex-col items-center m-12 gap-4 space-y-4">
        <label htmlFor="calorieGoal">Calorie Goal</label>
        <input
          type="number"
          id="calorieGoal"
          name="calorieGoal"
          placeholder="Calorie Goal"
          value={calorieGoal}
          onChange={(e) => setCalorieGoal(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <label htmlFor="waterGoal">{waterGoalLabel}</label>
        <input
          type="number"
          id="waterGoal"
          name="waterGoal"
          placeholder={waterGoalPlaceholder}
          value={waterGoalInput}
          min="1"
          step="1"
          onChange={(e) => setWaterGoalInput(e.target.value)}
          className="border p-2 rounded"
        />

        <label htmlFor="waterUnit">Water Display Unit</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleWaterUnitChange('cups')}
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${
              waterUnit === 'cups'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cups
          </button>

          <button
            type="button"
            onClick={() => handleWaterUnitChange('oz')}
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${
              waterUnit === 'oz'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ounces (oz)
          </button>
        </div>

        <label htmlFor="password">New Password</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />

        <label htmlFor="protein">Protein Goal (g)</label>
        <input
          type="number"
          id="protein"
          name="protein"
          placeholder="Protein in grams"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          className="border p-2 rounded"
        />

        <label htmlFor="fat">Fat Goal (g)</label>
        <input
          type="number"
          id="fat"
          name="fat"
          placeholder="Fat in grams"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          className="border p-2 rounded"
        />

        <label htmlFor="carbs">Carbs Goal (g)</label>
        <input
          type="number"
          id="carbs"
          name="carbs"
          placeholder="Carbs in grams"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          className="border p-2 rounded"
        />

        <label htmlFor="profilePic" className="sr-only">Profile Picture</label>
        <input
          type="file"
          id="profilePic"
          name="profilePic"
          onChange={handleImageUpload}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-1/8 bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>

        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

export default Profile;