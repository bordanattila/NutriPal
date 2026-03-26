/**
 * @file SearchComponent.jsx
 * @module SearchComponent
 * @description Provides logic for handling food searches, including barcode detection and search term queries.
 */
import api from '@nutripal/shared/src/utils/api';

/**
 * Handles food search by either barcode or search string.
 *
 * @async
 * @function handleSearch
 * @param {Object} params - Object containing handler props.
 * @param {string} params.name - The search input (food name or barcode).
 * @param {Function} params.setArray - Function to update the food results array.
 * @param {Function} params.setError - Function to update error state.
 * @param {Function} [params.setBarcode] - Optional. Function to redirect by barcode (used for barcode scanning).
 * @returns {Promise<void>} Resolves when search is completed.
 */
export const handleSearch = async ({ name, setArray, setError, setBarcode }) => {

  // If the input is all digits, treat it as a barcode.
  if (/^\d+$/.test(name)) {

    // Call the barcode API endpoint
    try {
      const barcodeResponse = await api.get(`api/foodByBarcode?barcode=${name}`);
      const barcodeData = await barcodeResponse.json();
      
      // Clear list display and trigger redirect via barcode ID
      setArray([]);
      setBarcode(barcodeData.food_id.value);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error(`Barcode search error: ${error.message}`);
    }
  } else {

    // Otherwise, treat it as a normal text search.
    try {
      const response = await api.get(`api/foodByName?searchExpression=${encodeURIComponent(name)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Search response data:', data); // Debug log
      
      // Handle different possible response structures from FatSecret API
      let foods = [];
      if (data?.foods?.food) {
        // Structure: { foods: { food: [...] } }
        foods = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];
      } else if (data?.foods) {
        // Structure: { foods: [...] }
        foods = Array.isArray(data.foods) ? data.foods : [];
      } else if (Array.isArray(data)) {
        // Structure: [...]
        foods = data;
      } else if (data?.error) {
        // Error response from API
        throw new Error(data.error.message || 'Search failed');
      }
      
      // Update UI with search results or empty if not found
      setArray(foods);
      setError(null);
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage = error.message || 'Failed to search for food. Please try again.';
      setError(errorMessage);
      
      // Only show alert if it's a real error (not just empty results)
      if (error.message && !error.message.includes('HTTP error! Status: 200')) {
        console.error(`Search failed: ${errorMessage}`);
      }
    }
  }
};