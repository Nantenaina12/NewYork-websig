import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Map from '../components/Map';
import StatisticsPanel from '../components/StatisticsPanel';
import AdminPanel from '../components/AdminPanel';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [boroughFilter, setBoroughFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        boroughFilter={boroughFilter}
        setBoroughFilter={setBoroughFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'map' && (
          <Map 
            boroughFilter={boroughFilter} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}
        {activeTab === 'stats' && (
          <div className="p-6 h-full overflow-y-auto bg-gray-50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatisticsPanel />
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col items-center justify-center text-gray-400">
                <p className="text-lg font-medium">Autres indicateurs</p>
                <p className="text-sm">(densité, évolution, etc.)</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'admin' && <AdminPanel />}
      </div>
    </div>
  );
};

export default Dashboard;