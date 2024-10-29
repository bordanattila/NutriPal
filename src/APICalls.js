
import ky from 'ky';

// Function to make a FatSecret API call
export const searchFoodByName = async (accessToken, searchExpression) => {
  console.log(searchExpression)
    // const accessToken = await getAccessToken()
    console.log(accessToken)
    const searchUrl = 'https://platform.fatsecret.com/rest/foods/search/v1';
    try{
        const response = await ky.post(searchUrl, {
            params: {
                method: 'foods.search',
                search_expression: searchExpression,
                format: 'json'
              },
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              }
    });
    console.log(response)
    if (response.data && response.data.foods && Array.isArray(response.data.foods.food)) {
        return response.data;
      } else {
        console.error('Unexpected response structure:', response.data);
        return null;  // Return null if the structure is not as expected
      }
    } catch (error) {
      console.error('Error searching for food:', error.response ? error.response.data : error.message);
    }
};
