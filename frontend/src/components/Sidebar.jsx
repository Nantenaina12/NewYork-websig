import React from 'react';
import { 
  FaMap, 
  FaChartBar, 
  FaSignOutAlt, 
  FaFilter, 
  FaSearch,
  FaCity,
  FaUserCircle,
  FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  boroughFilter, 
  setBoroughFilter, 
  searchTerm, 
  setSearchTerm,
  onSearch,
  isMobile = false
}) => {
  const { logout, user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const boroughs = ['Manhattan', 'Brooklyn', 'Queens', 'The Bronx', 'Staten Island'];

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-y-auto w-auto min-w-[200px] md:min-w-[220px] p-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700">
        <div className="bg-yellow-400 p-2 rounded-xl flex-shrink-0">
          <FaCity className="text-nyc-blue text-xl" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight">NYC WebSIG</h1>
          <p className="text-xs text-gray-400">New York City</p>
        </div>
      </div>

      {/* User info */}
      <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/50 p-2 rounded-lg mb-4">
        <FaUserCircle className="flex-shrink-0" />
        <span className="truncate">{user?.username || 'Utilisateur'}</span>
        {isAdmin && <span className="ml-auto text-xs bg-red-600 px-2 py-0.5 rounded-full flex-shrink-0">Admin</span>}
      </div>

      {/* Navigation */}
      <div className="space-y-1">
        <button
          onClick={() => setActiveTab('map')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
            activeTab === 'map' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'hover:bg-gray-700 text-gray-300'
          }`}
        >
          <FaMap className="flex-shrink-0" /> <span>Carte</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
            activeTab === 'stats' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'hover:bg-gray-700 text-gray-300'
          }`}
        >
          <FaChartBar className="flex-shrink-0" /> <span>Statistiques</span>
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
              activeTab === 'admin' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' 
                : 'hover:bg-gray-700 text-gray-300'
            }`}
          >
            <FaShieldAlt className="flex-shrink-0" /> <span>Admin</span>
          </button>
        )}
      </div>

      {/* Filtres - uniquement sur l'onglet carte */}
      {activeTab === 'map' && (
        <div className="mt-4 space-y-3 bg-gray-800/50 p-3 rounded-xl border border-gray-700">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <FaFilter className="flex-shrink-0" /> Filtres
          </h3>
          
          <select
            value={boroughFilter}
            onChange={(e) => setBoroughFilter(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-1.5 border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="">Tous les arrondissements</option>
            {boroughs.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <div className="flex">
            <input
              type="text"
              placeholder="Nom du quartier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-gray-700 text-white rounded-l-lg px-3 py-1.5 border border-gray-600 focus:outline-none focus:border-blue-500 text-sm min-w-0"
            />
            <button
              onClick={onSearch}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-r-lg transition flex-shrink-0"
            >
              <FaSearch className="text-sm" />
            </button>
          </div>
        </div>
      )}

      {/* Légende */}
      <div className="mt-4 bg-gray-800/30 p-3 rounded-xl border border-gray-700/50">
        <p className="text-xs text-gray-400 mb-1">Légende</p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span> Quartiers</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></span> Métros</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-400 rounded-sm"></span> Routes</span>
        </div>
      </div>

      {/* Déconnexion */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-600/20 text-red-400 hover:text-red-300 transition text-sm"
        >
          <FaSignOutAlt className="flex-shrink-0" /> Déconnexion
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">© 2025 NYC WebSIG</p>
      </div>
    </div>
  );
};

export default Sidebar;