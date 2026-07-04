import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8',
        font: { family: "'Inter', sans-serif" }
      }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f8fafc',
      bodyColor: '#cbd5e1',
      borderColor: '#334155',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      boxPadding: 4
    }
  },
  scales: {
    x: {
      grid: { color: '#334155', drawBorder: false },
      ticks: { color: '#94a3b8', font: { family: "'Inter', sans-serif" } }
    },
    y: {
      grid: { color: '#334155', drawBorder: false },
      ticks: { color: '#94a3b8', font: { family: "'Inter', sans-serif" } }
    }
  }
};

export const ConfidenceTrendChart = () => {
  const data = {
    labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25'],
    datasets: [
      {
        label: 'Confidence Score (%)',
        data: [85, 88, 92, 90, 95, 94],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#1e293b',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  return (
    <div className="h-64 w-full">
      <Line data={data} options={commonOptions} />
    </div>
  );
};

export const EmotionDistributionChart = () => {
  const data = {
    labels: ['Happy', 'Neutral', 'Sad', 'Angry', 'Surprise'],
    datasets: [
      {
        data: [400, 300, 100, 50, 150],
        backgroundColor: [
          '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B'
        ],
        borderColor: '#1E293B',
        borderWidth: 3,
        hoverOffset: 4
      }
    ]
  };

  const options = {
    ...commonOptions,
    scales: { x: { display: false }, y: { display: false } },
    cutout: '70%',
    plugins: {
      ...commonOptions.plugins,
      legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 20 } }
    }
  };

  return (
    <div className="h-64 w-full">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export const DailyPredictionsChart = () => {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Total Predictions',
        data: [1200, 2100, 800, 1600, 2400, 3200, 1500],
        backgroundColor: '#10B981',
        borderRadius: 4,
        hoverBackgroundColor: '#059669'
      }
    ]
  };

  return (
    <div className="h-64 w-full">
      <Bar data={data} options={commonOptions} />
    </div>
  );
};

export const WeeklyPredictionsChart = () => {
  const data = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Positive Emotions Trend',
        data: [450, 600, 800, 750],
        fill: true,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointRadius: 0,
        pointHoverRadius: 6
      }
    ]
  };

  return (
    <div className="h-64 w-full">
      <Line data={data} options={commonOptions} />
    </div>
  );
};
