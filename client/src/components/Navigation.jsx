import { React } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faBook, faHouse, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faClipboard as faRegularClipboard } from '@fortawesome/free-regular-svg-icons';

// const Navigation = () => {
//   return (
//     <div className="flex flex-row justify-evenly min-h-96 bg-gradient-to-r from-green-400 to-teal-500 shadow-lg my-1"> 
//     <div className='flex flex-col'>
//     <FontAwesomeIcon icon="fa-solid fa-utensils" />
//         <spam>Meals</spam>    
//         </div>
//         <spam><FontAwesomeIcon icon="fa-regular fa-book" />Recipes</spam>    
//         <Link to="/dashboard"><FontAwesomeIcon icon="fa-light fa-house" />Dashboard</Link>
//         <Link to="/search"><FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />Search</Link>
//         <spam><FontAwesomeIcon icon="fa-regular fa-clipboard" />Tracker</spam>    
//     </div>
//   );
// };

const navigationItems = [
  { icon: faUtensils, label: 'Meals' },
  { icon: faBook, label: 'Recipes' },
  { to: '/dashboard', icon: faHouse, label: 'Dashboard' },
  { to: '/search', icon: faMagnifyingGlass, label: 'Search' },
  { icon: faRegularClipboard, label: 'Tracker' },
];

const Navigation = () => {
  return (
    <div className="flex flex-row justify-evenly min-h-96 p-2 bg-gradient-to-r from-green-400 to-teal-500 shadow-lg my-1">
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