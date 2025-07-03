import React from 'react';

export default function ItemList({ items, renderItem, onRemove }) {
  return (
    <ul className="list-none mt-4 w-full max-w-lg">
      {items.map((item, index) => (
        <li key={index} className="relative rounded-md p-2 m-2 bg-teal-100">
          {renderItem(item)}
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => onRemove(index)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#f00" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}