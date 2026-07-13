// frontend/src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log('[API] API_URL =', API_URL); // Log pour vérifier

// Fonction pour afficher l'URL appelée
const logAndCall = async (url, params = null) => {
  const fullUrl = params ? `${API_URL}${url}` : `${API_URL}${url}`;
  console.log('[API] Appel vers :', fullUrl);
  try {
    const response = await axios.get(fullUrl, { params });
    return response.data;
  } catch (error) {
    console.error('[API] Erreur', error.response?.status, error.response?.data || error.message);
    throw error;
  }
};

export const fetchNeighborhoods = async () => {
  return logAndCall('/api/neighborhoods/geojson');
};

export const searchNeighborhoods = async (query) => {
  return logAndCall('/api/neighborhoods/search', { q: query });
};

export const fetchSubways = async () => {
  return logAndCall('/api/subways/geojson');
};

export const fetchWithinRadius = async (lat, lon, radius = 500) => {
  return logAndCall('/api/spatial/within-radius', { lat, lon, radius });
};

export const fetchCensus = async () => {
  return logAndCall('/api/census/geojson');
};

export const fetchStreets = async () => {
  return logAndCall('/api/streets/geojson');
};

export const fetchRue = async () => {
  return logAndCall('/api/rue/geojson');
};