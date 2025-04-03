/**
 * @file Calendar.jsx
 * @description Custom calendar dropdown component built with native React and Luxon.
 */

import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { DateTime } from 'luxon';

/**
 * Calendar Component
 *
 * @component
 * @param {Object} props
 * @param {DateTime} [props.value=DateTime.now()] - Initial selected date.
 * @param {function} props.onChange - Callback triggered when the selected date changes.
 * @param {number} [props.minYear=1920] - Earliest year to include in the dropdown.
 * @param {number} [props.maxYear=DateTime.now().year] - Latest year to include.
 * @param {string} [props.className] - Optional tailwind or custom class string.
 * @returns {JSX.Element}
 */
const Calendar = ({
  value = DateTime.now(),
  onChange = () => { },
  minYear = 1920,
  maxYear = DateTime.now().year,
  className = ''
}) => {
  // Selected values for year, month, and day
  const [selectedYear, setSelectedYear] = useState(value.year);
  const [selectedMonth, setSelectedMonth] = useState(value.month);
  const [selectedDay, setSelectedDay] = useState(value.day);

  // Update selections if parent `value` changes
  useEffect(() => {
    setSelectedYear(value.year);
    setSelectedMonth(value.month);
    setSelectedDay(value.day);
  }, [value]);

  // Track which dropdown is open
  const [openSelect, setOpenSelect] = useState('');

  // Generate options
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  // Use luxon to determine the number of days in the selected month/year
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  /**
   * Get number of days in a given month and year.
   * @param {number} year
   * @param {number} month
   * @returns {number}
   */
  const getDaysInMonth = (year, month) => {
    return DateTime.fromObject({ year, month }).daysInMonth;
  };

  // Generate list of days based on month/year
  const days = Array.from(
    { length: getDaysInMonth(selectedYear, selectedMonth) },
    (_, i) => i + 1
  );

  // Notify parent of new date whenever any field changes
  useEffect(() => {
    const newDate = DateTime.fromObject({ year: selectedYear, month: selectedMonth, day: selectedDay });
    onChange(newDate);
  }, [selectedYear, selectedMonth, selectedDay, onChange]);


  // Auto-adjust invalid days if month/year changes
  useEffect(() => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  /**
   * @component SelectWrapper
   * @description Reusable dropdown for selecting a date unit.
   * @param {Object} props
   * @param {Array<number>} props.options - Dropdown options (e.g., days, months, years)
   * @param {number} props.value - Currently selected value
   * @param {function} props.onChange - Callback for updating the value
   * @param {string} props.type - Type of the dropdown: 'day', 'month', or 'year'
   * @param {function} [props.format] - Optional formatting function
   */
  const SelectWrapper = ({
    options,
    value,
    onChange,
    type,
    format = (val) => val
  }) => (
    <div className="relative">
      <button
        onClick={() => setOpenSelect(openSelect === type ? '' : type)}
        className={`
          relative w-full px-8 py-3 text-left bg-white rounded-lg
          border border-gray-200 shadow-sm
          hover:border-blue-400 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${openSelect === type ? 'border-blue-500 ring-2 ring-blue-500' : ''}
        `}
      >
        <span className="block truncate text-gray-700 font-small">
          {format(value)}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDownIcon
            className={`h-5 w-5 text-gray-400 transition-transform duration-200
              ${openSelect === type ? 'transform rotate-180' : ''}`}
          />
        </span>
      </button>

      {openSelect === type && (
        <div className="
          absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg
          border border-gray-200 py-1 max-h-60 overflow-auto
          scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
        ">
          {options.map((option, index) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setOpenSelect('');
              }}
              className={`
                relative w-full text-left px-8 py-2
                hover:bg-blue-50 transition-colors duration-150
                ${value === option ? 'bg-blue-50 text-blue-600 font-small' : 'text-gray-700'}
              `}
            >
              {format(option)}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`relative ${className}`}
      onClick={e => e.stopPropagation()}
    >
      {/* Date selects */}
      <div className="flex gap-2">
        <SelectWrapper
          type="month"
          options={Array.from({ length: 12 }, (_, i) => i + 1)}
          value={selectedMonth}
          onChange={setSelectedMonth}
          format={(monthNumber) => {
            return months[monthNumber - 1];
          }}
        />

        <SelectWrapper
          type="day"
          options={days}
          value={selectedDay}
          onChange={setSelectedDay}
          format={(day) => day.toString().padStart(2, '0')}
        />

        <SelectWrapper
          type="year"
          options={years}
          value={selectedYear}
          onChange={setSelectedYear}
          format={(year) => year.toString()}
        />
      </div>
    </div>
  );
};

export default Calendar;