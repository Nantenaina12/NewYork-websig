// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Map from '../components/Map';
import StatisticsPanel from '../components/StatisticsPanel';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [boroughFilter, setBoroughFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    // La recherche est déjà gérée dans Map, on passe juste les props
    // On pourrait déclencher un événement, mais Map utilisera les props directement
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        boroughFilter={boroughFilter}
        setBoroughFilter={setBoroughFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
      />
      <div className="flex-1 relative">
        {activeTab === 'map' ? (
          <Map 
            boroughFilter={boroughFilter} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto">
            <StatisticsPanel />
            {/* Vous pouvez ajouter d'autres graphiques ici */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 flex items-center justify-center text-gray-400">
              <p>Autres statistiques (ex: densité, etc.)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;