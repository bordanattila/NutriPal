import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import Header from '../components/Header';

const Dashboard = () => {
  const navigate = useNavigate();

  const { loading, data, error } = useQuery(GET_USER, {
    context: {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    },
    onError: () => {
      navigate('/login');
    }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const { username } = data?.user || {};

  // Render the dashboard page with the fetched username
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {username}!</p>
    </div>
  );
};

export default Dashboard;
