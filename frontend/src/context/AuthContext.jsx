import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// URL du backend : variable d'environnement Vite ou fallback local
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Intercepteur pour ajouter le token à toutes les requêtes axios
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('[AuthProvider] Token au chargement :', token);
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('[AuthProvider] Token décodé :', decoded);
        setUser({
          token,
          username: decoded.sub,
          role: decoded.role || 'user',
        });
      } catch (error) {
        console.error('[AuthProvider] Token invalide', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    console.log('[Login] Tentative de connexion pour', username);
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await axios.post(`${API_URL}/token`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      console.log('[Login] Réponse du serveur :', response.data);

      const { access_token, role } = response.data;
      if (access_token) {
        localStorage.setItem('token', access_token);
        console.log('[Login] Token stocké dans localStorage');
        setUser({ token: access_token, username, role });
        return true;
      } else {
        throw new Error('Aucun token reçu');
      }
    } catch (error) {
      console.error('[Login] Erreur :', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    console.log('[Logout] Utilisateur déconnecté');
  };

  const value = { user, login, logout, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);