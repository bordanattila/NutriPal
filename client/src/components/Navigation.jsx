import { React } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faBook, faHouse, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faClipboard as faRegularClipboard } from '@fortawesome/free-regular-svg-icons';

const navigationItems = [
  { icon: faUtensils, label: 'Meals' },
  { to: '/recipe', icon: faBook, label: 'Recipes' },
  { to: '/dashboard', icon: faHouse, label: 'Dashboard' },
  { to: '/search', icon: faMagnifyingGlass, label: 'Search' },
  { to: 'dailyLogs', icon: faRegularClipboard, label: 'Logs' },
];

const Navigation = () => {
  return (
    <div className=" flex flex-row justify-evenly p-2 bg-gradient-to-r from-green-400 to-teal-500 shadow-lg my-1">
      {navigationItems.map((item, index) => {
        const content = (
          <>
            <FontAwesomeIcon icon={item.icon} />
            {item.label}
          </>
        );

        return item.to ? (
          <Link key={index} to={item.to} className="flex flex-col items-center">
            {content}
          </Link>
        ) : (
          <span key={index} className="flex flex-col items-center">
            {content}
          </span>
        );
      })}
    </div> 
  );
};

export default Navigation;