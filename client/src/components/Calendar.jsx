import { useState, useEffect } from 'react';
// import { Calendar, ChevronDown } from 'lucide-react';
import { CalendarDaysIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

const Calendar = ({ 
  value = new Date(),
  onChange = () => {},
  minYear = 1900,
  maxYear = new Date().getFullYear(),
  className = ''
}) => {
  // States for individual selects
  const [selectedYear, setSelectedYear] = useState(value.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(value.getMonth());
  const [selectedDay, setSelectedDay] = useState(value.getDate());
  
  // States for dropdowns
  const [openSelect, setOpenSelect] = useState('');

  // Generate options
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from(
    { length: getDaysInMonth(selectedYear, selectedMonth) },
    (_, i) => i + 1
  );

  // Update parent when any selection changes
  useEffect(() => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    onChange(newDate);
  }, [selectedYear, selectedMonth, selectedDay]);

  // Ensure valid day when month/year changes
  useEffect(() => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedYear, selectedMonth]);

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
          relative w-full px-4 py-3 text-left bg-white rounded-lg
          border border-gray-200 shadow-sm
          hover:border-blue-400 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${openSelect === type ? 'border-blue-500 ring-2 ring-blue-500' : ''}
        `}
      >
        <span className="block truncate text-gray-700 font-medium">
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
                relative w-full text-left px-4 py-2
                hover:bg-blue-50 transition-colors duration-150
                ${value === option ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}
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
      <div className="flex items-center gap-4">
        {/* Calendar icon */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <CalendarDaysIcon className="h-6 w-6 text-blue-500" />
        </div>
        
        {/* Date selects */}
        <div className="flex-1 grid grid-cols-3 gap-2">
          <SelectWrapper
            type="month"
            options={months.map((_, i) => i)}
            value={selectedMonth}
            onChange={setSelectedMonth}
            format={(monthIndex) => months[monthIndex]}
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

      {/* Selected date display */}
      <div className="mt-2 text-sm text-gray-500 text-center">
        Selected: {months[selectedMonth]} {selectedDay}, {selectedYear}
      </div>
    </div>
  );
};

export default Calendar;