// frontend/src/services/api.js
import axios from 'axios';

// URL du backend : variable d'environnement Vite ou fallback local
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper pour afficher les erreurs
const handleAxiosError = (error) => {
  console.error('[API] Erreur :', error.response?.status, error.response?.data || error.message);
  throw error;
};

export const fetchNeighborhoods = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/neighborhoods/geojson`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const searchNeighborhoods = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/api/neighborhoods/search`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const fetchSubways = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/subways/geojson`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const fetchWithinRadius = async (lat, lon, radius = 500) => {
  try {
    const response = await axios.get(`${API_URL}/api/spatial/within-radius`, {
      params: { lat, lon, radius }
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const fetchCensus = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/census/geojson`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const fetchStreets = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/streets/geojson`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const fetchRue = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/rue/geojson`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};