import React, { useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import BarcodeScanner from './BarcodeScanner';

const SearchBar = ({ nameOfFood, setNameOfFood, handleSearch, clearSearch, error }) => {
  const [scanning, setScanning] = useState(false);

  const handleToggleScanning = () => {
    // Toggle the scanner on or off.
    setScanning(prev => !prev);
  };

  // When BarcodeScanner detects a barcode.
  const handleDetectedBarcode = (barcode) => {
    console.log('Barcode detected:', barcode);
    console.log('Barcode detected:', barcode.value);
    // You might want to set the food name to the scanned barcode value
    setNameOfFood(barcode);
    // Stop scanning once a barcode is detected
    setScanning(false);
  };

  return (
    <>
    <form onSubmit={handleSearch} className="flex flex-col p-6 items-center justify-center mb-4 w-full max-w-lg">
      <div className="relative w-full">
        <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
        {!nameOfFood && (
        <button
          onClick={handleToggleScanning}
          className="barcode-button"
          aria-label="Scan Barcode"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <svg className="barcodeScanner absolute right-3 top-1" xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 64 64">
            {/* <!-- Outer rounded rectangle --> */}
            {/* <rect x="2" y="2" width="60" height="60" rx="8" ry="8" fill="none" stroke="#000" stroke-width="2" /> */}

            {/* <!-- Barcode vertical lines --> */}
            <g stroke="#000" stroke-width="3">
              <line x1="14" y1="16" x2="14" y2="48" />
            </g>
            <g stroke="#000" stroke-width="2">
              <line x1="20" y1="16" x2="20" y2="48" />
              <line x1="26" y1="16" x2="26" y2="48" />
              <line x1="32" y1="16" x2="32" y2="48" />
            </g>
            <g stroke="#000" stroke-width="3">
              <line x1="38" y1="16" x2="38" y2="48" />
              <line x1="44" y1="16" x2="44" y2="48" />
            </g><g stroke="#000" stroke-width="2">
              <line x1="50" y1="16" x2="50" y2="48" />
            </g>

            {/* <!-- Scanning line --> */}
            <line x1="2" y1="32" x2="62" y2="32" stroke="#f00" stroke-width="2" stroke-dasharray="4,2" />
          </svg>
        </button>
        )}
        <input
          type="text"
          id="foodName"
          value={nameOfFood}
          onChange={(e) => setNameOfFood(e.target.value)}
          placeholder="Search for a food"
          className="w-full pl-10 pr-10 py-2 rounded-full bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
        />

        {/* Clear Button */}
        {nameOfFood && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon />
          </button>
        )}
      </div>
      {/* Submit search button */}
      <button
        className="mt-4 bg-gradient-to-r from-green-400 to-teal-500 rounded-full shadow-lg hover:from-green-400 hover:to-blue-600 transition duration-300 text-white font-bold py-2 px-6 "
        type="submit"
      >
        Search
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </form>
 {/* Barcode Scanner Modal Overlay */}
 {scanning && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="relative w-full max-w-md">
      <BarcodeScanner 
        onDetected={handleDetectedBarcode} 
        onError={(err) => console.error(err)} 
      />
      <button
        type="button"
        className="absolute top-2 right-2 text-white bg-red-500 p-2 rounded-full"
        onClick={() => setScanning(false)}
        aria-label="Close Scanner"
      >
        X
      </button>
    </div>
  </div>
)}
</>
  );
};

export default SearchBar;