import React from "react";
import Auth from '../utils/auth';

const Dashboard = () => {

  const token = Auth.loggedIn() ? Auth.getToken() : null;
  
    return (
      <div>
        <h1>Dashboard</h1>
      </div>
    );
  };

  export default Dashboard;
