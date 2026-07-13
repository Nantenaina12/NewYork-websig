import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function validateGeoJSON(data) {
  if (!data || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
    throw new Error('Invalid GeoJSON: missing FeatureCollection or features array');
  }
  data.features = data.features.filter(f => f.geometry && f.geometry.type);
  return data;
}

export const fetchNeighborhoods = async () => {
  const response = await axios.get(`${API_URL}/api/neighborhoods/geojson`);
  return validateGeoJSON(response.data);
};

export const searchNeighborhoods = async (query, borough = null) => {
  const params = { q: query };
  if (borough) params.borough = borough;
  const response = await axios.get(`${API_URL}/api/neighborhoods/search`, { params });
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

// frontend/src/services/api.js (ajouter à la fin)

export const fetchStatistics = async () => {
  const response = await axios.get(`${API_URL}/api/statistics/population-by-borough`);
  return response.data;
};

export const fetchUsers = async () => {
  const response = await axios.get(`${API_URL}/api/admin/users`);
  return response.data;
};

export const fetchLogs = async (limit = 50) => {
  const response = await axios.get(`${API_URL}/api/admin/logs`, {
    params: { limit }
  });
  return response.data;
};

export const updateUserRole = async (userId, newRole) => {
  const response = await axios.put(`${API_URL}/api/admin/users/${userId}/role`, null, {
    params: { new_role: newRole }
  });
  return response.data;
};