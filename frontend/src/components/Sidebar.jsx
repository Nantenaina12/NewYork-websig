// src/components/Sidebar.jsx
import React from 'react';
import { FaMap, FaChartBar, FaSignOutAlt, FaFilter, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, boroughFilter, setBoroughFilter, searchTerm, setSearchTerm, handleSearch }) => {
  const { logout } = useAuth();
  const boroughs = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

  return (
    <div className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-full flex flex-col shadow-2xl">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>🗽</span> NYC WebSIG
        </h1>
        <p className="text-xs text-gray-400 mt-1">Plateforme cartographique interactive</p>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Navigation Tabs */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('map')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeTab === 'map' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-700'
            }`}
          >
            <FaMap /> Carte interactive
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeTab === 'stats' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-700'
            }`}
          >
            <FaChartBar /> Statistiques
          </button>
        </div>

        {/* Filtres (visibles uniquement sur l'onglet Carte) */}
        {activeTab === 'map' && (
          <div className="space-y-4 bg-gray-800/50 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FaFilter /> Filtres
            </h3>
            
            {/* Filtre Borough */}
            <select
              value={boroughFilter}
              onChange={(e) => setBoroughFilter(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="">Tous les arrondissements</option>
              {boroughs.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            {/* Recherche textuelle */}
            <div className="flex">
              <input
                type="text"
                placeholder="Nom du quartier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-gray-700 text-white rounded-l-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-r-lg transition"
              >
                <FaSearch />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Déconnexion */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600/20 text-red-400 hover:text-red-300 transition"
        >
          <FaSignOutAlt /> Déconnexion
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">© 2025 NYC WebSIG</p>
      </div>
    </div>
  );
};

export default Sidebar;