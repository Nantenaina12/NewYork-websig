import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// On récupère l'URL du backend ou on utilise localhost par défaut en développement local
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          token,
          username: decoded.sub,
          role: decoded.role || 'user',
        });
      } catch (error) {
        console.error('Token invalide', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    // Modification ici : utilisation de la variable API_URL
    const response = await axios.post(`${API_URL}/token`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const { access_token, role } = response.data;
    localStorage.setItem('token', access_token);
    setUser({ token: access_token, username, role });
    return true;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = { user, login, logout, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});