import React, { useEffect, useState } from 'react';
import ky from 'ky';

const FoodDetails = ({ match }) => {
  const [foodDetails, setFoodDetails] = useState(null);
  const foodId = match.params.foodId;

  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        const response = await ky.get(`/api/foodDetails/${foodId}`).json;
        setFoodDetails(response.data);
      } catch (error) {
        console.error('Error fetching food details:', error);
      }
    };

    fetchFoodDetails();
  }, [foodId]);

  if (!foodDetails) return <div>Loading...</div>;

  return (
    <div>
      <h1>Food Details</h1>
      <p>{foodDetails.food_name}</p>
      <p>{foodDetails.food_type}</p>
      <p>{foodDetails.food_url}</p>
      <label htmlFor="selectServing">Select serving size</label>
      <select name="serving" id="selectServing">
        {foodDetails.servings.serving.map((serving, index) => (
          <option key={index} value={serving.serving_description}>
            {serving.serving_description}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FoodDetails;
