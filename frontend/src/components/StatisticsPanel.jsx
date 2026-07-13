import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchStatistics } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatisticsPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await fetchStatistics();
        
        if (!stats || !Array.isArray(stats) || stats.length === 0) {
          throw new Error('Données statistiques invalides');
        }

        const chartData = {
          labels: stats.map(item => item.borough || 'Inconnu'),
          datasets: [
            {
              label: 'Population totale',
              data: stats.map(item => item.population || 0),
              backgroundColor: ['#FF6B6B', '#4A90D9', '#FFD93D', '#6BCB77', '#9B59B6'],
              borderRadius: 8,
            },
          ],
        };
        setData(chartData);
      } catch (err) {
        console.error('Erreur chargement statistiques :', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-48 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-200">
        <p className="text-red-500 text-center">❌ Erreur : {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <p className="text-gray-500 text-center">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
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
        height={250}
      />
    </div>
  );
};

export default StatisticsPanel;