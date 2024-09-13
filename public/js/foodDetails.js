const urlParams = new URLSearchParams(window.location.search);
const foodData = JSON.parse(urlParams.get('food_id'));


fetch(`/api/foodDetails/${food_id}`)
.then(response => response.json())
.then(foodData => {
    // Update the HTML elements with the food data
    document.getElementById('food_name').innerHTML = foodData.foods.food.food_name
    document.getElementById('food_description').innerHTML = foodData.foods.food.food_description
    // document.getElementById('food-info').innerHTML = `
    //   <p><strong>Food Name:</strong> ${foodData.foodName}</p>
    //   <p><strong>Calories:</strong> ${foodData.calories}</p>
    //   <p><strong>Macronutrients:</strong> ${foodData.macronutrients}</p>
    //   <!-- Add more fields as needed -->
    // `;
  })
  .catch(error => {
    console.error(`Error: ${error.message}`);
    // Handle error responses
  });

console.log(foodData);
