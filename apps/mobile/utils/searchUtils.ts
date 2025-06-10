import ky from 'ky';
import { Food } from '../types/food';
import { getAccessTokenValue } from './apiAuth';

interface SearchResponse {
  foods?: {
    food: Food[] | Food;
  };
}

interface SearchParams {
  name: string;
  setArray: (foods: Food[]) => void;
  setError: (error: string | null) => void;
  setBarcode: (barcode: string) => void;
}

export const handleSearch = async ({ name, setArray, setError, setBarcode }: SearchParams) => {
  try {
    console.log('Starting search for:', name);
    const token = await getAccessTokenValue();
    if (!token) {
      console.error('No token available');
      setError('Failed to authenticate with FatSecret API');
      return;
    }

    console.log('Making API request...');
    const response = await ky.get(`https://platform.fatsecret.com/rest/server.api`, {
      searchParams: {
        method: 'foods.search',
        search_expression: name,
        format: 'json'
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).json<SearchResponse>();

    console.log('API Response:', response);

    if (response.foods?.food) {
      const foods = Array.isArray(response.foods.food) ? response.foods.food : [response.foods.food];
      setArray(foods);
      setError(null);
    } else {
      console.log('No foods found in response');
      setArray([]);
      setError('No foods found');
    }
  } catch (error) {
    console.error('Search error:', error);
    setError('Failed to search for food');
    setArray([]);
  }
}; 