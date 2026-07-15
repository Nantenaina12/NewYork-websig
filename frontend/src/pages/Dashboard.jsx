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
        {/* Bouton hamburger pour mobile */}
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

        {activeTab === 'stats' && (
          <div className="p-4 md:p-6 h-full overflow-y-auto bg-gray-50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <StatisticsPanel />
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col items-center justify-center text-gray-400">
                <p className="text-lg font-medium">Autres indicateurs</p>
                <p className="text-sm">(densité, évolution, etc.)</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <Profile />
        )}

        {activeTab === 'admin' && (
          <AdminPanel />
        )}
      </div>
    </div>
  );
};

export default Dashboard;