// frontend/src/components/Map.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchNeighborhoods, fetchSubways, searchNeighborhoods, fetchWithinRadius } from '../services/api';

// Composant interne pour gérer les clics sur la carte (et les popups)
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

const Map = () => {
  const [neighborhoods, setNeighborhoods] = useState(null);
  const [subways, setSubways] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [radiusResults, setRadiusResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [radius, setRadius] = useState(500);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  // 1. Chargement initial des quartiers et métros
  useEffect(() => {
    const loadData = async () => {
      try {
        const [neighData, subwayData] = await Promise.all([
          fetchNeighborhoods(),
          fetchSubways(),
        ]);
        setNeighborhoods(neighData);
        setSubways(subwayData);
      } catch (error) {
        console.error('Erreur chargement initial :', error);
        alert('Impossible de charger les données. Vérifiez que le backend tourne.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. Gestion de la recherche attributaire
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const data = await searchNeighborhoods(searchTerm);
      setSearchResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  // 3. Gestion de la recherche spatiale (autour de moi)
  const handleRadiusSearch = async () => {
    if (!userLocation) {
      alert('Veuillez cliquer d\'abord sur la carte pour définir un point.');
      return;
    }
    try {
      const data = await fetchWithinRadius(userLocation.lat, userLocation.lng, radius);
      setRadiusResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  // 4. Gestion du clic sur la carte (pour la recherche spatiale)
  const handleMapClick = (latlng) => {
    setUserLocation(latlng);
    // On efface les résultats de recherche spatiale précédents pour éviter la confusion
    setRadiusResults(null);
  };

  // 5. Gestion du clic sur une feature (quartier) pour afficher ses infos
  const onFeatureClick = (event) => {
    const props = event.layer.feature.properties;
    setSelectedFeature(props);
  };

  // Styles pour les couches
  const neighborhoodStyle = {
    fillColor: '#4A90D9',
    weight: 2,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.5,
  };

  const highlightStyle = {
    fillColor: '#FF6B6B',
    weight: 3,
    color: '#FF0000',
    fillOpacity: 0.7,
  };

  const subwayStyle = {
    color: '#FFD700',
    weight: 4,
    opacity: 0.8,
    radius: 6,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-xl text-blue-600 animate-pulse">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Barre d'outils (recherche + spatial) */}
      <div className="bg-white p-4 shadow-md z-10 flex flex-wrap gap-4 items-center">
        <form onSubmit={handleSearch} className="flex flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Rechercher un quartier (ex: Manhattan)"
            className="border border-gray-300 rounded-l px-4 py-2 w-full focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700">
            🔍
          </button>
        </form>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-2 w-20 text-center"
            placeholder="Rayon"
          />
          <span className="text-sm text-gray-600">mètres</span>
          <button
            onClick={handleRadiusSearch}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            📍 Autour de moi
          </button>
          <button
  onClick={() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        // Optionnel : recentrer la carte
        // mapRef.current.flyTo([latitude, longitude], 14);
      });
    } else {
      alert('Géolocalisation non supportée');
    }
  }}
  className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 text-sm"
>
  📡 Ma position
</button>
          {userLocation && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Point: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </span>
          )}
        </div>

        <button
          onClick={() => {
            setSearchResults(null);
            setRadiusResults(null);
            setSelectedFeature(null);
            setSearchTerm('');
          }}
          className="bg-gray-300 px-3 py-2 rounded hover:bg-gray-400 text-sm"
        >
          Réinitialiser
        </button>
      </div>

      {/* Panneau d'informations (si une feature est sélectionnée) */}
      {selectedFeature && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-3 m-2 rounded shadow z-10">
          <h3 className="font-bold text-lg">{selectedFeature.name || selectedFeature.boroname}</h3>
          <p className="text-sm text-gray-700">ID: {selectedFeature.gid}</p>
          {selectedFeature.population && (
            <p className="text-sm text-gray-700">Population: {selectedFeature.population.toLocaleString()}</p>
          )}
          <button
            onClick={() => setSelectedFeature(null)}
            className="text-xs text-red-500 underline mt-1"
          >
            Fermer
          </button>
        </div>
      )}

      {/* La carte Leaflet */}
      <div className="flex-1 relative">
        <MapContainer
          center={[40.7128, -74.0060]}
          zoom={11}
          className="h-full w-full"
        >
          {/* Fond de carte OpenStreetMap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Gestionnaire de clic */}
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Contrôle des couches */}
          <LayersControl position="topright">
            {/* Couche des quartiers (par défaut) */}
            <LayersControl.Overlay name="Quartiers" checked>
              <GeoJSON
                key="neighborhoods"
                data={neighborhoods}
                style={neighborhoodStyle}
                eventHandlers={{
                  click: onFeatureClick,
                }}
              />
            </LayersControl.Overlay>

            {/* Couche des métros */}
            <LayersControl.Overlay name="Stations de métro">
              <GeoJSON
                key="subways"
                data={subways}
                pointToLayer={(feature, latlng) => {
                  return L.circleMarker(latlng, subwayStyle);
                }}
              />
            </LayersControl.Overlay>

            {/* Résultats de la recherche attributaire (en surbrillance) */}
            {searchResults && searchResults.features.length > 0 && (
              <LayersControl.Overlay name="Résultats recherche" checked>
                <GeoJSON
                  key="search-results"
                  data={searchResults}
                  style={highlightStyle}
                  eventHandlers={{
                    click: onFeatureClick,
                  }}
                />
              </LayersControl.Overlay>
            )}

            {/* Résultats de la recherche spatiale */}
            {radiusResults && radiusResults.features.length > 0 && (
              <LayersControl.Overlay name="Blocs à proximité" checked>
                <GeoJSON
                  key="radius-results"
                  data={radiusResults}
                  style={{
                    fillColor: '#FFA500',
                    weight: 2,
                    color: '#FF4500',
                    fillOpacity: 0.6,
                  }}
                  eventHandlers={{
                    click: onFeatureClick,
                  }}
                />
              </LayersControl.Overlay>
            )}
          </LayersControl>
        </MapContainer>

        {/* Petite légende en bas à droite */}
        <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow text-xs z-[1000]">
          <span className="inline-block w-3 h-3 bg-blue-500 mr-1"></span> Quartiers<br />
          <span className="inline-block w-3 h-3 bg-yellow-400 mr-1 rounded-full"></span> Métros<br />
          <span className="inline-block w-3 h-3 bg-orange-500 mr-1"></span> Résultat spatial
        </div>
      </div>
    </div>
  );
};

export default Map;