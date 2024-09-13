document.getElementById('manualButton').addEventListener('click', async (event) => {
  event.preventDefault();

  const foodName = document.getElementById('foodName').value.trim();

  try {
    const response = await fetch('/api/scanBarcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ foodName })
    })

    if (response.ok) {
      const foodData = await response.json(); // Get the food data from the response
      console.log("got response", foodData);


      const searchResultsContainer = document.getElementById('searchResults');
      searchResultsContainer.innerHTML = ``;

      foodData.foods.food.forEach(foodItem => {
        const foodItemElement = `
        <div>
        <p><strong>Food Name:</strong> ${foodItem.food_name}</p>
        <p><strong>Type:</strong> ${foodItem.food_type}</p>
        <p><strong>Description:</strong> ${foodItem.food_description}</p>
        </div>
        `;
        searchResultsContainer.innerHTML += foodItemElement;
      });

      // Pass the food data to the foodDetails.html page
      // window.location.href = `/api/foodDetails`;
    } else {
      // Handle error responses
      if (response.status >= 200 && response.status < 300) {
        console.log('food ok');
      } else {
        const errorMessage = await response.json();
        alert(errorMessage.message);
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    alert(`Entry failed: ${error.message}`);
    // Send error report to server, if desired
    // fetch('/error-report', { method: 'POST', body: JSON.stringify(error) });
  }
});