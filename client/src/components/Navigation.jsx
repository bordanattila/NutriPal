import { React } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faBook, faHouse, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faClipboard as faRegularClipboard } from '@fortawesome/free-regular-svg-icons';

const navigationItems = [
  { to: '/meals', icon: faUtensils, label: 'Meals' },
  { to: '/recipe', icon: faBook, label: 'Recipes' },
  { to: '/dashboard', icon: faHouse, label: 'Dashboard' },
  { to: '/logOptions', icon: faPlus, label: 'Log Food' },
  { to: '/dailyLogs', icon: faRegularClipboard, label: 'Logs' },
];

const Navigation = () => {
  return (
    <div className="flex flex-row justify-evenly items-center p-4 bg-gradient-to-r from-green-400 to-teal-500 shadow-lg">
      {navigationItems.map((item, index) => (
        <Link
          key={index}
          to={item.to}
          className="flex flex-col items-center hover:text-gray-200 transition px-2"
        >
          {/* Icon */}
          <FontAwesomeIcon icon={item.icon} className="text-2xl mb-1" />

          {/* Label */}
          <span className="text-sm">{item.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default Navigation;