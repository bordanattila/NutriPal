document.getElementById('manualButton').addEventListener('click', async (event) => {
  event.preventDefault();

  const foodName = document.getElementById('foodName').value.trim();
console.log(foodName)
  try {
    const response = await fetch('/api/foodSearch/scanBarcode', {
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
        <a id='selectedFood' class='food' href='/api/foodDetails/foodDetails/${foodItem.food_id}'>
          <p><strong>Food Name:</strong> ${foodItem.food_name}</p>
          <p><strong>Type:</strong> ${foodItem.food_type}</p>
          <p><strong>Description:</strong> ${foodItem.food_description}</p>
        </a>
         <hr>
        `;
        searchResultsContainer.innerHTML += foodItemElement;
      });
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
    // Send error report to server
    fetch('/error-report', { method: 'POST', body: JSON.stringify(error) });
  }
});

const foodElements = document.getElementsByClassName('food');

for (let i = 0; i < foodElements.length; i++) {
  foodElements[i].addEventListener('click', async (event) => {
    event.preventDefault();
    try {
      const foodId = event.target.id;

      const response = await fetch(`/api/foodDetails/foodDetails/${foodId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ foodId })
      });
      if (response.ok) {
        const foodData = await response.json();
        // window.location.href = '/foodDetails/foodDetails/${foodId}'
        console.log(foodData)

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
      alert(`Search failed: ${error.message}`);
    }
  });
};