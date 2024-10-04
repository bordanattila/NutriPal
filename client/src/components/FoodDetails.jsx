import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ky from 'ky';

const api = ky.create({
  prefixUrl: 'http://localhost:3000',
});

const FoodDetails = () => {
  const [foodDetails, setFoodDetails] = useState(null);
  const { foodId } = useParams();
  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        const response = await api.get(`api/foodDetails/foodById/${foodId}`);
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const responseData = await response.json();
          console.log('API Response:', responseData);
          setFoodDetails(responseData);
        } else {
          console.error('Expected JSON, got:', contentType);
          const text = await response.text();
          console.error('Response text:', text);
          throw new Error(`Invalid response: ${contentType}`);
        }
      } catch (error) {
        console.error('Error fetching food details:', error);
      }
    };

    fetchFoodDetails();
  }, []);

  if (!foodDetails) return <div>Loading...</div>;

  return (
    <div>
      <h1>Food Details</h1>
      <p><strong>{foodDetails.food.food_name}</strong></p>
      <p><strong>{foodDetails.food.food_type}</strong></p>
      <label htmlFor="selectServing">Select serving size</label>
      <select name="serving" id="selectServing">
        {foodDetails.food.servings.serving.map((serving, index) => (
          <option key={index} value={serving.serving_description}>
            {serving.serving_description}
          </option>
        ))}
      </select>
      <p>{foodDetails.food.food_url}</p>
    </div>
  );
};

export default FoodDetails;
