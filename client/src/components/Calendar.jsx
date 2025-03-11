import { useState, useEffect } from 'react';
// import { Calendar, ChevronDown } from 'lucide-react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { DateTime } from 'luxon';

const Calendar = ({
  value = DateTime.now(),
  onChange = () => { },
  minYear = 1920,
  maxYear = DateTime.now().year,
  className = ''
}) => {
  // States for individual selects
  const [selectedYear, setSelectedYear] = useState(value.year);
  const [selectedMonth, setSelectedMonth] = useState(value.month);
  const [selectedDay, setSelectedDay] = useState(value.day);
  useEffect(() => {
    setSelectedYear(value.year);
    setSelectedMonth(value.month);
    setSelectedDay(value.day);
  }, [value]);

  // States for dropdowns
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

  const getDaysInMonth = (year, month) => {
    return DateTime.fromObject({ year, month }).daysInMonth;
  };

  const days = Array.from(
    { length: getDaysInMonth(selectedYear, selectedMonth) },
    (_, i) => i + 1
  );

  // Update parent when any selection changes
  useEffect(() => {
    const newDate = DateTime.fromObject({ year: selectedYear, month: selectedMonth, day: selectedDay });
    onChange(newDate);
  }, [selectedYear, selectedMonth, selectedDay, onChange]);

  // Ensure valid day when month/year changes
  useEffect(() => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  // Generic select dropdown component
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
            // console.log("Formatting month number:", monthNumber);
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