import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/api/admin/logs');
        setLogs(res.data);
      } catch (err) {
        console.error(err);
        alert('Vous devez être admin pour voir cette page.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div>Chargement...</div>;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord Admin</h1>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-gray-700">ID</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Utilisateur</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Action</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Détails</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t">
                <td className="p-3 text-sm">{log.id}</td>
                <td className="p-3 text-sm">{log.user_id || 'Anonyme'}</td>
                <td className="p-3 text-sm">{log.action}</td>
                <td className="p-3 text-sm">{log.details}</td>
                <td className="p-3 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;