/**
 * @file SearchComponent.jsx
 * @module SearchComponent
 * @description Provides logic for handling food searches, including barcode detection and search term queries.
 */
import ky from 'ky';


const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});

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
      const response = await api.get(`api/foodByName?searchExpression=${name}`);
      const data = await response.json();
      
      // Update UI with search results or empty if not found
      setArray(data?.foods?.food || []);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error(`Error: ${error.message}`);
      
      // Fallback alert and optional error reporting
      alert(`Entry failed: ${error.message}`);
      fetch('/error-report', { method: 'POST', body: JSON.stringify(error) });
    }
  }
};