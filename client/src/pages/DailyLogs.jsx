import React, { useEffect, useState } from 'react';
import ky from 'ky';
import { useNavigate } from "react-router-dom";
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations';
import useAuth from '../hooks/RefreshToken';
import { CalendarDaysIcon } from '@heroicons/react/20/solid';
import Calendar from '../components/Calendar';

const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL,
});

const DailyLogs = () => {
  useAuth();
  const navigate = useNavigate();
  const [logHistory, setLogHistory] = useState([]);
  const [date, setDate] = useState(new Date());

  const { loading, data, logError } = useQuery(GET_USER, {
    context: {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    },
    onError: () => {
      navigate('/login');
    }
  });

  // Get the food items logged today

  const userId = data?.user?._id;

  useEffect(() => {
    const fetchLogHistory = async () => {
      try {
        const response = await api.get(`api/recent-foods/${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setLogHistory(data);
      } catch (error) {
        console.error('Error fetching recent foods:', error);
      }
    };

    fetchLogHistory();
  }, []);


  return (
    <div className="flex flex-col items-center justify-center min-h-max p-6">
      <h1 className="text-3xl font-bold mb-4">Daily Log</h1>
      <div className="flex flex-col items-center justify-center w-full p-6">
        <div className="flex flex-col items-center justify-center w-full p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Foods</h2>
          {/* <div className="flex flex-col items-center justify-center w-full p-6"> */}
            {/* {logHistory.map((item, index) => (
                    <div key={index} className="flex flex-row items-center justify-center w-full p-6">
                    <div className="flex flex-col items-center justify-center w-full p-6">
                    <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                    <p className="text-base font-bold mb-2">{item.date}</p>
                     */}
            {/* <CalendarDaysIcon /> */}
            <div className="p-6 max-w-2xl mx-auto">
      <Calendar
        value={date}
        onChange={setDate}
        minYear={1900}
        maxYear={2024}
      />
    </div>
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};

export default DailyLogs;