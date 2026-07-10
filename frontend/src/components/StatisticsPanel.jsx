// src/components/StatisticsPanel.jsx
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatisticsPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/statistics/population-by-borough');
        const stats = res.data;
        
        const chartData = {
          labels: stats.map(item => item.borough),
          datasets: [
            {
              label: 'Population totale',
              data: stats.map(item => item.population),
              backgroundColor: ['#FF6B6B', '#4A90D9', '#FFD93D', '#6BCB77', '#9B59B6'],
              borderRadius: 8,
            },
          ],
        };
        setData(chartData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse bg-gray-200 h-64 rounded-xl"></div>;
  if (!data) return <p>Aucune donnée disponible</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
        📊 Population par arrondissement
      </h3>
      <Bar 
        data={data} 
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: false },
          },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
            x: { grid: { display: false } },
          },
        }}
        height={200}
      />
    </div>
  );
};

export default StatisticsPanel;