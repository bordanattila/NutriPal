import ky from 'ky';

const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});

export const handleSearch = async ({ name, setArray, setError, setBarcode }) => {
  // If the input is all digits, treat it as a barcode.
  if (/^\d+$/.test(name)) {
    // Call the barcode API endpoint
    try {
      console.log("input is barcode")
      const barcodeResponse = await api.get(`api/foodByBarcode?barcode=${name}`);
      const barcodeData = await barcodeResponse.json();
      console.log("barcode return", barcodeData.food_id.value)
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
      console.log(data)
      setArray(data?.foods?.food || []);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error(`Error: ${error.message}`);
      alert(`Entry failed: ${error.message}`);
      // Optionally send error report to server
      fetch('/error-report', { method: 'POST', body: JSON.stringify(error) });
    }
  }
};