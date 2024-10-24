import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ky from 'ky';
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

const api = ky.create({
  prefixUrl: 'http://localhost:3000',
});

const FoodDetails = () => {
  const { foodId } = useParams();
  const [foodDetails, setFoodDetails] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoodDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`api/foodById?food_id=${foodId}`);
        const responseData = await response.json();
        setFoodDetails(responseData);

        // The purpose of this line is to ensure that there is at least one serving available before proceeding to set the selected serving in the state. 
        // It prevents potential errors that could occur if the code tries to access properties of undefined or null.
        if (responseData.food?.servings?.serving?.length > 0) {
          setSelected(responseData.food.servings.serving[0]);
        }
      } catch (error) {
        console.error('Error fetching food details:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFoodDetails();
  }, [foodId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <div className="flex flex-col items-center justify-center bg-gray-100">
        <h1 className='text-3xl font-bold mb-4'>Food Details</h1>
      </div>
      <p><strong>{foodDetails.food.food_name}</strong></p>
      <p><strong>{foodDetails.food.food_type}</strong></p>

      <Listbox value={selected} onChange={setSelected}>
        <Label className="block text-sm font-medium leading-6 text-gray-900">Select serving</Label>
        <div className="relative mt-2">
          <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
            <span className="flex items-center">
              <span className="ml-3 block truncate">{selected.serving_description}</span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </span>
          </ListboxButton>

          <ListboxOptions
            transition
            className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
          >
            {foodDetails.food.servings.serving.map((serving) => (
              <ListboxOption
                key={serving.serving_id}
                value={serving}
                className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
              >
                <div className="flex items-center">
                  <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">
                    {serving.serving_description}
                  </span>
                </div>

                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                  <CheckIcon aria-hidden="true" className="h-5 w-5" />
                </span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </>
  );
};


export default FoodDetails;
