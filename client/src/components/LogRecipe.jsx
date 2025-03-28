import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const FoodDetails = () => {
  const { recipeName, recipeID } = useParams();
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

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const response = await api.get(`api/log-recipe/${recipeID}?servings=${servingCount + fractionValue}`);
        const responseData = await response.json();
  
        setFoodDetails({
          food: {
            food_name: responseData.recipeName
          }
        });
  
        const serving = {
          serving_description: responseData.selectedServing.serving_description,
          calories: responseData.nutrition.caloriesPerServing,
          carbohydrate: responseData.nutrition.carbohydratePerServing,
          protein: responseData.nutrition.proteinPerServing,
          fat: responseData.nutrition.fatPerServing,
          saturated_fat: responseData.nutrition.saturatedFatPerServing,
          sodium: responseData.nutrition.sodiumPerServing,
          fiber: responseData.nutrition.fiberPerServing,
          serving_id: 'S-custom' 
        };
  
        setSelectedServing(serving);
        setServingArray([serving.serving_description]); // wrap in array
        setServingID(serving.serving_id);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching recipe details:", err);
        setError(err);
        setLoading(false);
      }
    };
  
    fetchRecipeDetails();
  }, [recipeID, servingCount, fractionValue]);

  // Prepare stats for chart
  const statsForChart = selectedServing ? [
    { name: 'Carbs', value: selectedServing.carbohydrate || 0 },
    { name: 'Protein', value: selectedServing.protein || 0 },
    { name: 'Fat', value: selectedServing.fat || 0 },
    { name: 'Calories', value: selectedServing.calories }
  ] : [];

  // Handling change in serving size
  const handleServingCount = (count) => {
    setServingCount(count);
  };

  // Fractions for serving size
  const Fractions = ['0', '1/8', '1/4', '1/3', '3/8', '1/2', '5/8', '2/3', '3/4', '7/8']

  // Handling change in fractions
  function fractionToFloat(fractionStr) {
    const [numerator , denominator ] = fractionStr.split('/');
    return parseFloat(numerator ) / parseFloat(denominator );
  }
  
  const handleFractionCount = (fractionStr) => {
    const fraction = fractionToFloat(fractionStr);
    setFractionCount(fractionStr);
    setFractionValue(fraction);
  };

   // Handling change in serving size
   const handleMealChange = (selectedMeal) => {
    setMeal(selectedMeal);
  };

  // Handling addition of food to Daily Log
  const handleAddFood = async () => {
      if (!selectedServing || !meal || !logData) {
        alert('Please select serving size, number of servings, and meal type.');
        return;
      }
      const foodEntry = {
        user_id: userID,
        food_name: recipeName,
        serving_size: selectedServing.serving_description,
        number_of_servings: servingCount,
        fraction_of_serving: fractionCount,
        calories: selectedServing.calories * (servingCount + fractionValue),
        carbohydrate: selectedServing.carbohydrate * (servingCount + fractionValue),
        protein: selectedServing.protein * (servingCount + fractionValue),
        fat: selectedServing.fat * (servingCount + fractionValue),
        saturated_fat: selectedServing.saturated_fat * (servingCount + fractionValue),
        sodium: selectedServing.sodium * (servingCount + fractionValue),
        fiber: selectedServing.fiber * (servingCount + fractionValue),
        meal_type: meal.toLocaleLowerCase(),
        food_type: 'recipe'
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
          setTimeout(() => { navigate(`/saved-recipes`) }, 1000)
        } else {
          toast.error('Failed to add food.');
        }
      } catch (error) {
        console.error('Error adding food:', error);
        toast.error('Error adding food. Please try again.');
      }
    
  };

  const goBack = () => {
    navigate(`/saved-recipes`)
  };


    // Set serving_id when a serving is selected
    const handleServingChange = (servingId) => {
      const selected = servingArray.find((s) => s.serving_id === servingId);
      setSelectedServing(selected);
      setServingID(servingId); 
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
     
      <>
          {/* Dropdown for serving size */}
          <DropdownMenu
            label="Serving size"
            value={selectedServing}
            // value={servingID}
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
      

      <br />
     
      <div>
        {/* Toaster to provide feedback to user */}
        <ToastContainer autoClose={500} />
      </div>
    </div>
  );
};

export default FoodDetails;
