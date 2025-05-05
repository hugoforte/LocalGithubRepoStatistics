	'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, // Import TimeScale for time-based x-axis
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns'; // Import the date adapter

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale // Register TimeScale
);

interface CommitActivityData {
  date: string; // Expecting 'YYYY-MM-DD'
  count: number;
}

interface CommitActivityChartProps {
  commitActivity: CommitActivityData[];
}

const CommitActivityChart: React.FC<CommitActivityChartProps> = ({ commitActivity }) => {
  if (!commitActivity || commitActivity.length === 0) {
    return <p className="text-gray-600 dark:text-gray-400">No commit activity data available for the selected period or filters.</p>;
  }

  const chartData = {
    // Use dates directly as x-values for the time scale
    labels: commitActivity.map(activity => activity.date),
    datasets: [
      {
        label: 'Commits per Day',
        // Map data to {x: date, y: count} format for time scale
        data: commitActivity.map(activity => ({ x: activity.date, y: activity.count })),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            color: '#cbd5e1', // Light gray for dark mode legend text
        }
      },
      title: {
        display: true,
        text: 'Commit Activity Over Time',
        color: '#e2e8f0', // Lighter gray for dark mode title
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        type: 'time' as const, // Use time scale
        time: {
          unit: 'day' as const, // Display units in days
          minUnit: 'day' as const, // *** Force daily unit minimum ***
          tooltipFormat: 'PPP', // Format for tooltips (e.g., 'Jan 1, 2024')
          displayFormats: {
             day: 'MMM d' // Format for axis labels (e.g., 'Jan 1')
          }
        },
        title: {
          display: true,
          text: 'Date',
          color: '#94a3b8', // Medium gray for axis titles
        },
         ticks: {
            color: '#cbd5e1', // Light gray for dark mode ticks
            maxRotation: 45,
            minRotation: 45,
            // autoSkip: true, // Allow Chart.js to skip labels if too crowded
            // maxTicksLimit: 31 // Limit ticks if needed, but might conflict with daily goal
         },
         grid: {
            color: '#374151', // Darker grid lines for dark mode
         }
      },
      y: {
        title: {
          display: true,
          text: 'Number of Commits',
          color: '#94a3b8',
        },
        beginAtZero: true,
        ticks: {
            color: '#cbd5e1', // Light gray for dark mode ticks
            precision: 0 // Ensure whole numbers for commit counts
        },
        grid: {
            color: '#374151', // Darker grid lines for dark mode
        }
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Commit Activity</h3>
      <div className="relative h-64 sm:h-96"> {/* Responsive height */}
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};

export default CommitActivityChart;

