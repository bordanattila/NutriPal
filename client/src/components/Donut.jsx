import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = ({ stats }) => {
  // Extracting values from stats
  const macronutrients = stats.filter(stat => stat.name !== 'Calories');
  const calories = stats.find(stat => stat.name === 'Calories').value;

  const data = {
    labels: macronutrients.map(item => item.name),
    datasets: [
      {
        // Extracting the numerical values
        data: macronutrients.map(item => parseInt(item.value)), 
        // Colors for Carbs, Protein, and Fat
        backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56'], 
        hoverBackgroundColor: ['#ff4d71', '#2c9ce2', '#ffbf47'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    // Creates the donut effect
    cutout: '70%', 
    plugins: {
      legend: {
        // Shows the legend
        display: true, 
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${stats[tooltipItem.dataIndex].value}`;
          }
        }
      },
    },
    responsive: true,
    // Allows responsive scaling
    maintainAspectRatio: false, 
  };

  return (
    <div className="relative w-64 h-64">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-700">{calories}</p>
          <p className="text-sm font-medium text-gray-500">Calories</p>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
