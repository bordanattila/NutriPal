import { React } from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <div className="flex flex-row justify-evenly min-h-96 bg-gray-300 my-1"> 
        <spam>Meals</spam>    
        <spam>Recipes</spam>    
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/search">Search</Link>
        <spam>Tracker</spam>    
    </div>
  );
};

export default Navigation;