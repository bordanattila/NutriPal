import { React } from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <div>
      <h1>This is the navbear</h1>  
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/search">Search</Link>
    </div>
  );
};

export default Navigation;