import React, { useState, useEffect } from 'react';
import { FaUserCog, FaHistory } from 'react-icons/fa';
import { fetchUsers, fetchLogs, updateUserRole } from '../services/api';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (activeTab === 'users') fetchUsersData();
    else fetchLogsData();
  }, [activeTab]);

  const fetchUsersData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement utilisateurs :', err);
      setError('Impossible de charger les utilisateurs');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLogs(50);
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement logs :', err);
      setError('Impossible de charger les logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      await fetchUsersData();
    } catch (err) {
      console.error('Erreur changement rôle :', err);
      alert('Erreur lors du changement de rôle');
    }
  };

  if (loading) {
    return (
      <div className="p-6 h-full overflow-y-auto bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500 animate-pulse">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 h-full overflow-y-auto bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">❌ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Espace Administration</h2>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaUserCog className="inline mr-2" /> Utilisateurs ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'logs' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaHistory className="inline mr-2" /> Historique ({logs.length})
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Aucun utilisateur trouvé</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Nom</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Rôle</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{user.id}</td>
                    <td className="p-3 font-medium">{user.username}</td>
                    <td className="p-3">{user.email || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">
                      {user.role === 'admin' ? (
                        <button
                          onClick={() => changeRole(user.id, 'user')}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-xs transition"
                        >
                          Rétrograder
                        </button>
                      ) : (
                        <button
                          onClick={() => changeRole(user.id, 'admin')}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs transition"
                        >
                          Promouvoir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Aucun log trouvé</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Utilisateur</th>
                    <th className="p-3 text-left">Action</th>
                    <th className="p-3 text-left">Détails</th>
                    <th className="p-3 text-left">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-3 font-medium">{log.username}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{log.details || '-'}</td>
                      <td className="p-3 text-xs font-mono">{log.ip_address || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;