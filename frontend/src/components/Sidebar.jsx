import React, { useState } from 'react';
import { 
  FaMap, 
  FaChartBar, 
  FaSignOutAlt, 
  FaFilter, 
  FaSearch,
  FaCity,
  FaUserCircle,
  FaShieldAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  boroughFilter, 
  setBoroughFilter, 
  searchTerm, 
  setSearchTerm,
  onSearch
}) => {
  const { logout, user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const boroughs = ['Manhattan', 'Brooklyn', 'Queens', 'The Bronx', 'Staten Island'];
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  // Contenu de la sidebar (réutilisable)
  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 p-2 rounded-xl">
            <FaCity className="text-nyc-blue text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold">NYC WebSIG</h1>
            <p className="text-xs text-gray-400">New York City</p>
          </div>
        </div>
        <button onClick={closeMobile} className="lg:hidden text-gray-400 hover:text-white">
          <FaTimes size={24} />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 text-sm text-gray-300 bg-gray-800/50 p-2 rounded-lg mx-6">
        <FaUserCircle />
        <span>{user?.username || 'Utilisateur'}</span>
        {isAdmin && <span className="ml-auto text-xs bg-red-600 px-2 py-0.5 rounded-full">Admin</span>}
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <button
            onClick={() => { setActiveTab('map'); closeMobile(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'map' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'hover:bg-gray-700 text-gray-300'
            }`}
          >
            <FaMap /> Carte interactive
          </button>
          <button
            onClick={() => { setActiveTab('stats'); closeMobile(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'stats' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'hover:bg-gray-700 text-gray-300'
            }`}
          >
            <FaChartBar /> Statistiques
          </button>
          {isAdmin && (
            <button
              onClick={() => { setActiveTab('admin'); closeMobile(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'admin' 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' 
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <FaShieldAlt /> Administration
            </button>
          )}
        </div>

        {/* Filtres */}
        {activeTab === 'map' && (
          <div className="space-y-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FaFilter /> Filtres
            </h3>
            
            <select
              value={boroughFilter}
              onChange={(e) => setBoroughFilter(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
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
                className="flex-1 bg-gray-700 text-white rounded-l-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
              />
              <button
                onClick={onSearch}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-r-lg transition"
              >
                <FaSearch />
              </button>
            </div>
          </div>
        )}

        {/* Légende */}
        <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-1">Légende</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-sm"></span> Quartiers</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded-full"></span> Métros</span>
          </div>
        </div>
      </div>

      {/* Déconnexion */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => { logout(); closeMobile(); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-600/20 text-red-400 hover:text-red-300 transition"
        >
          <FaSignOutAlt /> Déconnexion
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">© 2025 NYC WebSIG</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Version desktop : toujours visible */}
      <div className="hidden lg:block w-72 h-full flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Version mobile : hamburger + overlay */}
      <div className="lg:hidden">
        {/* Bouton hamburger en haut à gauche */}
        <button
          onClick={toggleMobile}
          className="fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 transition"
        >
          <FaBars size={24} />
        </button>

        {/* Overlay avec la sidebar */}
        <div
          className={`fixed inset-0 z-40 transition-transform duration-300 ease-in-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ width: '80%', maxWidth: '320px' }}
        >
          {sidebarContent}
        </div>

        {/* Fond sombre derrière la sidebar */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={closeMobile}
          />
        )}
      </div>
    </>
  );
};

export default Sidebar;