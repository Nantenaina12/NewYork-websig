// frontend/src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Fonction utilitaire pour valider le GeoJSON
function validateGeoJSON(data) {
  if (!data || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
    throw new Error('Invalid GeoJSON: missing FeatureCollection or features array');
  }
  // Filtrer les features sans géométrie pour éviter les erreurs
  data.features = data.features.filter(f => f.geometry && f.geometry.type);
  return data;
}

export const fetchNeighborhoods = async () => {
  const response = await axios.get(`${API_URL}/api/neighborhoods/geojson`);
  const data = validateGeoJSON(response.data);
  return data;
};

export const searchNeighborhoods = async (query) => {
  const response = await axios.get(`${API_URL}/api/neighborhoods/search`, {
    params: { q: query }
  });
  return validateGeoJSON(response.data);
};

export const fetchSubways = async () => {
  const response = await axios.get(`${API_URL}/api/subways/geojson`);
  return validateGeoJSON(response.data);
};

export const fetchCensus = async () => {
  const response = await axios.get(`${API_URL}/api/census/geojson`);
  return validateGeoJSON(response.data);
};

export const fetchStreets = async () => {
  const response = await axios.get(`${API_URL}/api/streets/geojson`);
  return validateGeoJSON(response.data);
};

export const fetchRue = async () => {
  const response = await axios.get(`${API_URL}/api/rue/geojson`);
  return validateGeoJSON(response.data);
};

export const fetchWithinRadius = async (lat, lon, radius = 500) => {
  const response = await axios.get(`${API_URL}/api/spatial/within-radius`, {
    params: { lat, lon, radius }
  });
  return validateGeoJSON(response.data);
};