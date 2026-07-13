// frontend/src/services/api.js

// Récupère l'URL de Railway ou utilise localhost en développement local
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchNeighborhoods = async () => {
  const response = await fetch(`${API_URL}/neighborhoods/geojson`);
  if (!response.ok) throw new Error('Erreur chargement quartiers');
  return response.json();
};

export const searchNeighborhoods = async (query) => {
  const response = await fetch(`${API_URL}/neighborhoods/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Erreur recherche');
  return response.json();
};

export const fetchSubways = async () => {
  const response = await fetch(`${API_URL}/subways/geojson`);
  if (!response.ok) throw new Error('Erreur chargement métros');
  return response.json();
};

export const fetchWithinRadius = async (lat, lon, radius = 500) => {
  const response = await fetch(`${API_URL}/spatial/within-radius?lat=${lat}&lon=${lon}&radius=${radius}`);
  if (!response.ok) throw new Error('Erreur recherche spatiale');
  return response.json();
};

export const fetchCensus = async () => {
  const response = await fetch(`${API_URL}/census/geojson`);
  if (!response.ok) throw new Error('Erreur chargement census');
  return response.json();
};

export const fetchStreets = async () => {
  const response = await fetch(`${API_URL}/streets/geojson`);
  if (!response.ok) throw new Error('Erreur chargement streets');
  return response.json();
};

export const fetchRue = async () => {
  const response = await fetch(`${API_URL}/rue/geojson`);
  if (!response.ok) throw new Error('Erreur chargement rue');
  return response.json();
};