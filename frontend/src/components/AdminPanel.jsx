import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCog, FaHistory } from 'react-icons/fa';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else fetchLogs();
  }, [activeTab]);

  const fetchUsers = async () => {
    const res = await axios.get('/api/admin/users');
    setUsers(res.data);
  };

  const fetchLogs = async () => {
    const res = await axios.get('/api/admin/logs?limit=50');
    setLogs(res.data);
  };

  const changeRole = async (userId, newRole) => {
    await axios.put(`/api/admin/users/${userId}/role?new_role=${newRole}`);
    fetchUsers();
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Espace Administration</h2>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <FaUserCog className="inline mr-2" /> Utilisateurs
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'logs' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <FaHistory className="inline mr-2" /> Historique
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
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
                  <td className="p-3">{user.username}</td>
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
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-xs"
                      >
                        Rétrograder
                      </button>
                    ) : (
                      <button
                        onClick={() => changeRole(user.id, 'admin')}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs"
                      >
                        Promouvoir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
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
                  <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3">{log.username}</td>
                  <td className="p-3">{log.action}</td>
                  <td className="p-3">{log.details}</td>
                  <td className="p-3">{log.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;