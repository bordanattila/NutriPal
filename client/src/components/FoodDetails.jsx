import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ky from 'ky';
import DropdownMenu from './Dropdown';
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import { useNavigate } from "react-router-dom";

const api = ky.create({
  prefixUrl: 'http://localhost:3000',
});

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const FoodDetails = () => {
  const { foodId } = useParams();
  const [foodDetails, setFoodDetails] = useState(null);
  const [error, setError] = useState(null);
  const [selectedServing, setSelectedServing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servingArray, setServingArray] = useState(null);
  const [servingID, setServingID] = useState(null);
  const [servingCount, setServingCount] = useState(1);
  const [meal, setMeal] = useState(mealTypes[0]);
  const navigate = useNavigate();
  const { data: logData, loading: logLoading, error: logError } = useQuery(GET_USER, {
    context: {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    },
    onCompleted: (data) => {
      // Set user ID after the query is completed
      if (data && data.user && data.user._id) {
        setUserID(data.user._id);
      }
    },
    onError: () => {
      navigate('/login');
    },
  });
  const [userID, setUserID] = useState(null);

  

  useEffect(() => {
    const fetchFoodDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`api/foodById?food_id=${foodId}`);
        const responseData = await response.json();
        setFoodDetails(responseData);

        // The purpose of this line is to ensure that there is at least one serving available before proceeding to set the selected serving in the state. 
        // It prevents potential errors that could occur if the code tries to access properties of undefined or null.
        if (responseData.food?.servings?.serving?.length > 0) {
          setSelectedServing(responseData.food.servings.serving[0]);
          setServingID(responseData.food.servings.serving[0].serving_id)
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
  }, [foodId]);

    // Set user ID from log data
    useEffect(() => {
      if (logData?.user) {
        setUserID(logData.user.destructuredID);
      }
    }, [logData]);

  // Set serving_id when a serving is selected
  const handleServingChange = (serving) => {
    setSelectedServing(serving);
    setServingID(serving.serving_id);
    console.log(servingID)
  };

  // Handling change in serving size
  const handleServingCount = (count) => {
    setServingCount(count);
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
      serving_size: selectedServing.serving_description,
      number_of_servings: servingCount,
      calories: selectedServing.calories * servingCount,
      carbohydrate: selectedServing.carbohydrate * servingCount,
      protein: selectedServing.protein * servingCount,
      fat: selectedServing.fat * servingCount,
      saturated_fat: selectedServing.saturated_fat * servingCount,
      sodium: selectedServing.sodium * servingCount,
      fiber: selectedServing.fiber * servingCount,
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
              dateCreated: new Date(), 
          },
        });
      console.log(foodEntry)

      if (dailyLogResponse.ok) {
        alert('Food added successfully!');
      } else {
        alert('Failed to add food.');
      }
    } catch (error) {
      console.error('Error adding food:', error);
      alert('Error adding food. Please try again.');
    }
  };
  if (loading || logLoading ) return <div>Loading...</div>;
  if (error || logError) return <div>Error: {error.message}</div>;  

  return (
    <>
      <div className="flex flex-col items-center justify-center max-h-2 bg-gradient-to-br from-teal-200 via-cyan-300 to-blue-300 p-6">
        <h1 className='text-3xl font-bold mb-4'>Food Details</h1>
      </div>
      <p><strong>{foodDetails.food.food_name}</strong></p>
      <p><strong>{foodDetails.food.food_type}</strong></p>

      {/* Displaying the details of the selected serving */}
      {selectedServing && servingCount && (
        <div className="py-4">
          <div>
            <strong>Calories:</strong> {((selectedServing.calories * servingCount).toFixed(2))}g
          </div>
          <div>
            <strong>Carbohydrate:</strong> {((selectedServing.carbohydrate * servingCount).toFixed(2))}g
          </div>
          <div>
            <strong>Protein:</strong> {((selectedServing.protein * servingCount).toFixed(2))}g
          </div>
          <div>
            <strong>Fat:</strong> {((selectedServing.fat * servingCount).toFixed(2))}g
          </div>
          Saturated fat: {((selectedServing.saturated_fat * servingCount).toFixed(2))}g<br />
          Sodium: {((selectedServing.sodium * servingCount).toFixed(2))}g<br />
          Fiber: {((selectedServing.fiber * servingCount).toFixed(2))}g<br />
        </div>
      )}

      {/* Dropdown for serving size */}
      <DropdownMenu
        label="Select serving size"
        value={selectedServing}
        onChange={handleServingChange}
        // options={foodDetails.food.servings.serving}
        options={servingArray}
        optionLabel={(serving) => serving.serving_description}
        optionKey={(serving) => serving.serving_id}
      />

      {/* Dropdown for serving count*/}
      <DropdownMenu
        label="Select number of servings"
        value={servingCount}
        onChange={handleServingCount}
        options={[...Array(100).keys()].map(i => i + 1)}
        optionLabel={(count) => count}
        optionKey={(count) => count}
      />

      {/* Dropdown for meal type*/}
      <DropdownMenu
        label="Select meal type"
        value={meal}
        onChange={handleMealChange}
        options={mealTypes}
        optionLabel={(meal) => meal}
        optionKey={(meal) => meal}
      /><br />

      <button
        onClick={handleAddFood} 
        className="w-full sm:w-1/2 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out mb-6">
        Add food
      </button>
    </>
  );
};

export default FoodDetails;
