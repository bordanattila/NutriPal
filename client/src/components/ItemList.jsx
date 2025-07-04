/**
 * @file ItemList.jsx
 * @module ItemList
 * @description
 *   A reusable React component for rendering a list of items with a remove button.
 *   Each item is displayed using a custom render function, and an onRemove callback
 *   is invoked when the user clicks the remove button for an item.
 *
 * @param {Object[]} props.items
 *   - An array of item objects to render. Each item must include a unique `id` property.
 * @param {Function} props.renderItem
 *   - A function that receives an item and returns JSX to display its content.
 * @param {Function} props.onRemove
 *   - A callback function invoked with the index of the item to remove.
 *
 * @returns {JSX.Element} A styled list of items with remove buttons.
 */
import React from 'react';

export default function ItemList({ items, renderItem, onRemove }) {
  return (
    <ul className="list-none mt-4 w-full max-w-lg mx-auto">
      {items.map((item, index) => (
        <li key={item.id} className="py-2">
          <div className="relative rounded-md p-2 m-2 bg-teal-100 hover:bg-teal-200 transition flex items-center">
            {/* Render custom content for this item */}
            <div className="flex-1">
              {renderItem(item)}
            </div>

            {/* Remove button with trash icon */}
            <button
              aria-label="Remove item"
              className="ml-4"
              onClick={() => onRemove(index)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                   viewBox="0 0 24 24" strokeWidth="1.5" stroke="#f00"
                   className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21
                         c.342.052.682.107 1.022.166m-1.022-.165L18.16
                         19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25
                         2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108
                         48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114
                         1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5
                         0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964
                         51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09
                         2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}