/**
 * @file FoodDetails.jsx
 * @module FoodDetails
 * @description Displays nutritional details for a selected food, allows user to select serving size, quantity, and meal type, then log it to a daily log or recipe.
 */
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ky from 'ky';
import DropdownMenu from './Dropdown';
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import { useNavigate } from "react-router-dom";
import DonutChart from './Donut';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/20/solid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DateTime } from 'luxon';

/**
 * @constant api
 * @description Pre-configured ky instance for sending API requests with base URL.
 */
const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});

/** Available meal types */
const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

/**
 * FoodDetails component
 *
 * @component
 * @description Fetches detailed information about a food item by ID and allows logging it to the user's daily log or recipe.
 * @returns {JSX.Element} UI for food selection and logging
 */
const FoodDetails = () => {
  const { source, foodId } = useParams();
  const [foodDetails, setFoodDetails] = useState(null);
  const [error, setError] = useState(null);
  const [selectedServing, setSelectedServing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servingArray, setServingArray] = useState(null);
  const [servingID, setServingID] = useState(null);
  const [servingCount, setServingCount] = useState(1);
  const [fractionCount, setFractionCount] = useState('0');
  const [fractionValue, setFractionValue] = useState(0);
  const [meal, setMeal] = useState(mealTypes[0]);
  const navigate = useNavigate();
  const [date, setDate] = useState(DateTime.now());

  const todaysDate = date.year + '-' + date.month + '-' + date.day

  const { data: logData, loading: logLoading, error: logError } = useQuery(GET_USER, {
    context: {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    },
    onError: () => {
      setDate(DateTime.now());
      navigate('/login');
    },
  });

  const [userID, setUserID] = useState(null);

  // Set user ID from log data
  useEffect(() => {
    if (logData?.user) {
      setUserID(logData.user._id);
    }
  }, [logData]);

   // Fetch food details on load
  useEffect(() => {
    const fetchFoodDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`api/${source}/foodById?food_id=${foodId}`);
        const responseData = await response.json();
        setFoodDetails(responseData);
        // The purpose of this line is to ensure that there is at least one serving available before proceeding to set the selected serving in the state. 
        // It prevents potential errors that could occur if the code tries to access properties of undefined or null.
        if (responseData.food?.servings?.serving?.length > 0) {
          setSelectedServing(responseData.food.servings.serving[0]);
          setServingID(responseData?.food?.servings?.serving?.[0]?.serving_id || servingID);
        }
        setServingArray(responseData.food.servings.serving);
      } catch (error) {
        console.error('Error fetching food details:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFoodDetails();
  }, [foodId, source, servingID, setServingID]);

    /** Prepare stats for DonutChart */
  const statsForChart = selectedServing ? [
    { name: 'Carbs', value: selectedServing.carbohydrate || 0 },
    { name: 'Protein', value: selectedServing.protein || 0 },
    { name: 'Fat', value: selectedServing.fat || 0 },
    { name: 'Calories', value: selectedServing.calories }
  ] : [];

  /** Set selected serving and update serving ID */
const handleServingChange = (serving) => {
  setSelectedServing(serving);
  setServingID(serving.serving_id);
};

   /** Set number of servings */
  const handleServingCount = (count) => {
    setServingCount(count);
  };

  // Fractions for dropdown menu
  const Fractions = ['0', '1/8', '1/4', '1/3', '3/8', '1/2', '5/8', '2/3', '3/4', '7/8']

   /** Convert fraction string to decimal (e.g., 1/2 => 0.5) */
  function fractionToFloat(fractionStr) {
    const [numerator , denominator ] = fractionStr.split('/');
    return parseFloat(numerator ) / parseFloat(denominator );
  }
  
    /** Handle selection of fractional serving size */
  const handleFractionCount = (fractionStr) => {
    const fraction = fractionToFloat(fractionStr);
    setFractionCount(fractionStr);
    setFractionValue(fraction);
  };

    /** Handle meal type selection */
  const handleMealChange = (selectedMeal) => {
    setMeal(selectedMeal);
  };

  /** Handle the food log submission (to daily log or recipe ingredient) */
  const handleAddFood = async () => {
    if (source === 'search') {
      if (!selectedServing || !meal || !logData) {
        alert('Please select serving size, number of servings, and meal type.');
        return;
      }
      const foodEntry = {
        user_id: userID,
        food_id: foodDetails.food.food_id,
        food_name: foodDetails.food.food_name,
        serving_id: selectedServing.serving_id,
        serving_size: selectedServing.serving_description,
        number_of_servings: servingCount,
        fraction_of_serving: fractionValue,
        calories: selectedServing.calories * (servingCount + fractionValue),
        carbohydrate: selectedServing.carbohydrate * (servingCount + fractionValue),
        protein: selectedServing.protein * (servingCount + fractionValue),
        fat: selectedServing.fat * (servingCount + fractionValue),
        saturated_fat: selectedServing.saturated_fat * (servingCount + fractionValue),
        sodium: selectedServing.sodium * (servingCount + fractionValue),
        fiber: selectedServing.fiber * (servingCount + fractionValue),
        brand: foodDetails.food.brand_name,
        meal_type: meal.toLocaleLowerCase(),
      };

      try {
        // Create OneFood document
        const foodResponse = await api.post('api/one-food', {
          json: foodEntry,
        });
        const foodData = await foodResponse.json();

        if (!foodResponse.ok) {
          throw new Error('Failed to create food entry.');
        }

        // Add the food entry to the DailyLog
        const dailyLogResponse = await api.post('api/daily-log', {
          json: {
            user_id: userID,
            foods: [foodData._id],
            dateCreated: todaysDate,
          },
        });

        if (dailyLogResponse.ok) {
          toast.success('Food added successfully!');
          setTimeout(() => { navigate(`/${source}`) }, 1000)
        } else {
          toast.error('Failed to add food.');
        }
      } catch (error) {
        console.error('Error adding food:', error);
        toast.error('Error adding food. Please try again.');
      }
    } else {
      const foodEntry = {
        user_id: userID,
        food_id: foodDetails.food.food_id,
        food_name: foodDetails.food.food_name,
        serving_id: selectedServing.serving_id,
        serving_size: selectedServing.serving_description,
        number_of_servings: servingCount,
        fraction_of_serving: fractionValue,
        calories: selectedServing.calories * (servingCount + fractionValue),
        carbohydrate: selectedServing.carbohydrate * (servingCount + fractionValue),
        protein: selectedServing.protein * (servingCount + fractionValue),
        fat: selectedServing.fat * (servingCount + fractionValue),
        saturated_fat: selectedServing.saturated_fat * (servingCount + fractionValue),
        sodium: selectedServing.sodium * (servingCount + fractionValue),
        fiber: selectedServing.fiber * (servingCount + fractionValue),
        brand: foodDetails.food.brand_name,
        meal_type: meal.toLocaleLowerCase(),
        food_type: 'api'
      };

      try {
        // Create OneFood document
        const foodResponse = await api.post('api/one-food', {
          json: foodEntry,
        });
        const foodData = await foodResponse.json();

        if (!foodResponse.ok) {
          throw new Error('Failed to create food entry.');
        }
        if (foodResponse.ok) {
          const ingredientID = foodData._id;
          const addedIngredient = foodData.food_name
          const ingredientServingCount = foodData.number_of_servings+(foodData.fraction_of_serving==='0' ? '' : ' and '+foodData.fraction_of_serving);
          const IngredientServingSize = foodData.serving_size;
          toast.success('Food added successfully!');
          // Send _id back to Recipe.jsx in state
          setTimeout(() => { navigate(`/${source}`, { state: { ingredientID, addedIngredient, ingredientServingCount, IngredientServingSize } }) }, 1000);
        }
      } catch (error) {
        console.error('Error adding food:', error);
        toast.error('Error adding food. Please try again.');
      }
    }
  };

    /** Go back to previous page */
  const goBack = () => {
    navigate(`/${source}`)
  };

  if (loading || logLoading) return <div>Loading...</div>;
  if (error || logError) return <div>Error: {error.message}</div>;



  return (
    <div className='pb-2.5'>
      <div className="flex flex-row items-center justify-between max-h-2 bg-gradient-to-r from-green-400 to-teal-500 px-6 pt-6 pb-9">
        {/* <h1 className='text-3xl font-bold mb-4'>Food Details</h1> */}
        <div>
          <ArrowLeftIcon onClick={goBack} className='w-7 h-7' />
        </div>
        <div>
          <p className='rounded-md p-2 bg-teal-100 text-base text-center'><strong>{foodDetails.food.food_name}</strong></p>
        </div>
        <div>
          <PlusIcon onClick={handleAddFood} className='w-7 h-7' />
        </div>
      </div>
      <div className='flex flex-row'>
        {/* Displaying the details of the selected serving */}
        {selectedServing && servingCount && (
          <div className="py-4 w-40">
            <div>
              <strong>Calories:</strong> {((selectedServing.calories * (servingCount + fractionValue)).toFixed(1))}g
            </div>
            <div>
              <strong>Carbohydrate:</strong> {((selectedServing.carbohydrate * (servingCount + fractionValue)).toFixed(1))}g
            </div>
            <div>
              <strong>Protein:</strong> {((selectedServing.protein * (servingCount + fractionValue)).toFixed(1))}g
            </div>
            <div>
              <strong>Fat:</strong> {((selectedServing.fat * (servingCount + fractionValue)).toFixed(1))}g
            </div>
            Saturated fat: {((selectedServing.saturated_fat * (servingCount + fractionValue)).toFixed(1))}g<br />
            Sodium: {((selectedServing.sodium * (servingCount + fractionValue)).toFixed(1))}g<br />
            Fiber: {((selectedServing.fiber * (servingCount + fractionValue)).toFixed(1))}g<br />
          </div>
        )}
        <div className="py-4 w-56 h-56">
          <DonutChart stats={statsForChart} />
        </div>
      </div>
      {source === 'search' ? (
        <>
          {/* Dropdown for Search page */}
          <DropdownMenu
            label="Serving size"
            value={selectedServing}
            onChange={handleServingChange}
            options={servingArray}
            optionLabel={(serving) => serving.serving_description}
            optionKey={(serving) => serving.serving_id}
          />

          <div className="flex space-x-4">
            {/* Dropdown for serving count*/}
            <DropdownMenu
              label="Number of servings"
              className="w-1/2"
              value={servingCount}
              onChange={handleServingCount}
              options={[...Array(101).keys()]}
              optionLabel={(count) => count}
              optionKey={(count) => count}
            />

            {/* Dropdown for fraction count*/}
            <DropdownMenu
              label="Fraction of serving"
              className="w-1/2"
              value={fractionCount}
              onChange={handleFractionCount}
              options={Fractions}
              optionLabel={(fraction) => fraction}
              optionKey={(fraction) => fraction}
            />
          </div>

          {/* Dropdown for meal type*/}
          <DropdownMenu
            label="Meal type"
            value={meal}
            onChange={handleMealChange}
            options={mealTypes}
            optionLabel={(meal) => meal}
            optionKey={(meal) => meal}
          />
        </>

      ) : (
        <>
          {/* Dropdown for Recipe page */}
          <DropdownMenu
            label="Serving size"
            value={selectedServing}
            onChange={handleServingChange}
            options={servingArray}
            optionLabel={(serving) => serving.serving_description}
            optionKey={(serving) => serving.serving_id}
          />

          <div className="flex space-x-4">
            {/* Dropdown for serving count*/}
            <DropdownMenu
              label="Number of servings"
              className="w-1/2"
              value={servingCount}
              onChange={handleServingCount}
              options={[...Array(101).keys()]}
              optionLabel={(count) => count}
              optionKey={(count) => count}
            />

            {/* Dropdown for fraction count*/}
            <DropdownMenu
              label="Fraction of serving"
              className="w-1/2"
              value={fractionCount}
              onChange={handleFractionCount}
              options={Fractions}
              optionLabel={(fraction) => fraction}
              optionKey={(fraction) => fraction}
            />
          </div>
        </>
      )}

      <br />
      {/* Link to nutrition label */}
      <div className='text-center'>
        <Link to={foodDetails.food.food_url} className=" text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">See nutrition label here</Link>
      </div>
      <div>
        {/* Toaster to provide feedback to user */}
        <ToastContainer autoClose={500} />
      </div>
    </div>
  );
};

export default FoodDetails;
