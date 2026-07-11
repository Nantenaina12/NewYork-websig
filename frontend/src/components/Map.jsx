// frontend/src/components/Map.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';

// Composant interne pour les clics
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

const Map = ({ boroughFilter, searchTerm, setSearchTerm }) => {
  const [neighborhoods, setNeighborhoods] = useState(null);
  const [subways, setSubways] = useState(null);
  const [census, setCensus] = useState(null);
  const [streets, setStreets] = useState(null);
  const [rue, setRue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [radiusResults, setRadiusResults] = useState(null);
  const [radius, setRadius] = useState(500);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  // 1. Chargement initial (quartiers + métros) avec filtre borough
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let url = '/api/neighborhoods/geojson';
        // Si un filtre borough est présent, on utilise l'endpoint search
        if (boroughFilter) {
          url = `/api/neighborhoods/search?borough=${encodeURIComponent(boroughFilter)}`;
        }
        const neighRes = await axios.get(url);
        setNeighborhoods(neighRes.data);

        const subwayRes = await axios.get('/api/subways/geojson');
        setSubways(subwayRes.data);
        

// Dans le useEffect de chargement, ajoutez :
      // ...(le code existant pour neighborhoods et subways)
        const [censusRes, streetsRes, rueRes] = await Promise.all([
        axios.get('/api/census/geojson'),
        axios.get('/api/streets/geojson'),
        axios.get('/api/rue/geojson'),
      ]);
      setNeighborhoods(neighRes.data);
      setSubways(subwayRes.data);
      setCensus(censusRes.data);
      setStreets(streetsRes.data);
      setRue(rueRes.data);
  
      } catch (error) {
        console.error('Erreur chargement initial :', error);
        alert('Impossible de charger les données. Vérifiez que le backend tourne.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [boroughFilter]); // Recharger quand le filtre change

  // 2. Gestion de la recherche textuelle (appelée depuis la sidebar ou localement)
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim() && !boroughFilter) {
      // Recharger tout
      try {
        const res = await axios.get('/api/neighborhoods/geojson');
        setNeighborhoods(res.data);
        setSearchResults(null);
      } catch (error) {
        console.error(error);
      }
      return;
    }
    try {
      let url = `/api/neighborhoods/search?q=${encodeURIComponent(searchTerm)}`;
      if (boroughFilter) {
        url += `&borough=${encodeURIComponent(boroughFilter)}`;
      }
      const res = await axios.get(url);
      setSearchResults(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // 3. Recherche spatiale (autour d'un point)
  const handleRadiusSearch = async () => {
    if (!userLocation) {
      alert('Veuillez cliquer sur la carte pour définir un point.');
      return;
    }
    try {
      const res = await axios.get('/api/spatial/within-radius', {
        params: {
          lat: userLocation.lat,
          lon: userLocation.lng,
          radius: radius,
        },
      });
      setRadiusResults(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // 4. Gestion du clic sur la carte
  const handleMapClick = (latlng) => {
    setUserLocation(latlng);
    setRadiusResults(null);
  };

  // 5. Clic sur une feature
  const onFeatureClick = (event) => {
    const props = event.layer.feature.properties;
    setSelectedFeature(props);
  };

  // Styles
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
      {/* Barre d'outils (recherche + spatial) - on peut l'ajouter ou la laisser dans la sidebar */}
      <div className="bg-white p-4 shadow-md z-10 flex flex-wrap gap-4 items-center">
        <form onSubmit={handleSearch} className="flex flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Rechercher un quartier"
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

      {/* Panneau d'informations */}
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

      {/* La carte */}
      <div className="flex-1 relative">
        <MapContainer
          center={[40.7128, -74.0060]}
          zoom={11}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />

          <LayersControl position="topright">
            <LayersControl.Overlay name="Quartiers" checked>
              <GeoJSON
                key="neighborhoods"
                data={neighborhoods}
                style={neighborhoodStyle}
                eventHandlers={{ click: onFeatureClick }}
              />
            </LayersControl.Overlay>

            <LayersControl.Overlay name="Stations de métro">
              <GeoJSON
                key="subways"
                data={subways}
                pointToLayer={(feature, latlng) => L.circleMarker(latlng, subwayStyle)}
              />
            </LayersControl.Overlay>
            <LayersControl.Overlay name="Blocs de recensement">
                <GeoJSON key="census" data={census} style={() => ({

                    fillColor: '#9B59B6',
                    weight: 1,
                    opacity: 0.7,
                    color: 'white',
                    fillOpacity: 0.3,})} eventHandlers={{ click: onFeatureClick }}/>
            </LayersControl.Overlay>

            <LayersControl.Overlay name="Rues (nyc_streets)">
                <GeoJSON key="streets" data={streets} style={() => ({
                     color: '#2ECC71',

                    weight: 2,
                    opacity: 0.6,})}/>
            </LayersControl.Overlay>

            <LayersControl.Overlay name="Rue (table rue)">
                <GeoJSON key="rue" data={rue} style={() => ({
                    color: '#E74C3C',
                    weight: 2,
                    opacity: 0.6,
                    dashArray: '5, 5',})} />
            </LayersControl.Overlay>
            {searchResults && searchResults.features.length > 0 && (
              <LayersControl.Overlay name="Résultats recherche" checked>
                <GeoJSON
                  key="search-results"
                  data={searchResults}
                  style={highlightStyle}
                  eventHandlers={{ click: onFeatureClick }}
                />
              </LayersControl.Overlay>
            )}

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
                  eventHandlers={{ click: onFeatureClick }}
                />
              </LayersControl.Overlay>
            )}
          </LayersControl>
        </MapContainer>

        <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow text-xs z-[1000]">
          <span className="inline-block w-3 h-3 bg-blue-500 mr-1"></span> Quartiers<br />
          <span className="inline-block w-3 h-3 bg-yellow-400 mr-1 rounded-full"></span> Métros<br />
          <span className="inline-block w-3 h-3 bg-red-400 mr-1 rounded-full"></span> Routes<br />        <span className="inline-block w-3 h-3 bg-green-400 mr-1 rounded-full"></span> Blocks<br />
          <span className="inline-block w-3 h-3 bg-orange-500 mr-1"></span> Résultat spatial
        </div>
      </div>
    </div>
  );
};

export default Map;