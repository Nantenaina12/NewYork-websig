// frontend/src/services/api.js
const API_BASE = '/api';

export const fetchNeighborhoods = async () => {
  const response = await fetch(`${API_BASE}/neighborhoods/geojson`);
  if (!response.ok) throw new Error('Erreur chargement quartiers');
  return response.json();
};

export const searchNeighborhoods = async (query) => {
  const response = await fetch(`${API_BASE}/neighborhoods/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Erreur recherche');
  return response.json();
};

export const fetchSubways = async () => {
  const response = await fetch(`${API_BASE}/subways/geojson`);
  if (!response.ok) throw new Error('Erreur chargement métros');
  return response.json();
};

export const fetchWithinRadius = async (lat, lon, radius = 500) => {
  const response = await fetch(`${API_BASE}/spatial/within-radius?lat=${lat}&lon=${lon}&radius=${radius}`);
  if (!response.ok) throw new Error('Erreur recherche spatiale');
  return response.json();
};