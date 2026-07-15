import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Map from '../components/Map';
import StatisticsPanel from '../components/StatisticsPanel';
import AdminPanel from '../components/AdminPanel';
import Profile from '../components/Profile';
import { FaBars } from 'react-icons/fa';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [boroughFilter, setBoroughFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`
        flex-shrink-0 transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'block' : 'hidden'} 
        md:block
      `}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          boroughFilter={boroughFilter}
          setBoroughFilter={setBoroughFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={() => {}}
          isMobile={true}
        />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 relative overflow-hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-lg hover:bg-gray-100 transition"
        >
          <FaBars size={24} className="text-gray-700" />
        </button>

        {activeTab === 'map' && (
          <Map 
            boroughFilter={boroughFilter} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}
        {activeTab === 'stats' && <StatisticsPanel />}
        {activeTab === 'profile' && <Profile />}
        {activeTab === 'admin' && <AdminPanel />}
      </div>
    </div>
  );
};

export default Dashboard;