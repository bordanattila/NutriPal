import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import DonutChart from '../components/Donut';
import useAuth from '../hooks/RefreshToken';

const stats = [
  { name: 'Carb', value: '120 g' },
  { name: 'Protein', value: '80 g' },
  { name: 'Fat', value: '36 g' },
  { name: 'Calories', value: '856' },
  // { name: 'Calorie goal', value: '2000' },
]

const Dashboard = () => {
  const navigate = useNavigate();
  // Validate token and refresh if needed
  useAuth();

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
    <>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Dashboard</h1>
    {/* <div className="flex flex-col items-center justify-center min-h-max bg-gradient-to-br from-teal-200 via-cyan-300 to-blue-300 pt-6 pl-6 pr-6">
        <p className="text-lg font-medium text-gray-700">Welcome, {username}!</p>
      </div> */}
      
      
      {/* <div className="mx-auto max-w-7xl px-6 lg:px-8"> */}

        {/* <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none"> */}
          
          <dl className="flex justify-evenly gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4 bg-gradient-to-br from-teal-200 via-cyan-300 to-blue-300 p-6">
            {stats.map((stat) => (
              <div key={stat.name} className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-gray-900">{stat.name}</dt>
                <dd className="text-xl font-semibold tracking-tight text-black">{stat.value}</dd>
              </div>
            ))}
          </dl>
       <div className='flex justify-center'>
          <DonutChart stats={stats} />
       </div>
        {/* </div> */}
      {/* </div> */}
      {/* <div className="flex justify-center items-center min-h-max bg-gray-100">
      <DonutChart stats={stats} />
    </div> */}

    </>
  );
};

export default Dashboard;
