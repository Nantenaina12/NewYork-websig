import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // On peut décoder le token pour récupérer le role, mais on le stockera lors du login
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const response = await axios.post('http://localhost:8000/token', formData, {
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