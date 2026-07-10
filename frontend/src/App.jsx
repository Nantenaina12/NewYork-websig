// frontend/src/App.jsx
import React from 'react';
import Map from './components/Map';

function App() {
  return (
    <div className="h-screen w-full flex flex-col">
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-3 shadow-lg flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🗽 WEBSIG - New York
        </h1>
        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
          Données spatiales NYC
        </span>
      </header>
      <div className="flex-1 overflow-hidden">
        <Map />
      </div>
    </div>
  );
}

export default App;