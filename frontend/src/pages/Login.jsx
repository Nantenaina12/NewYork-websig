import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaMapMarkedAlt } from 'react-icons/fa';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Identifiants incorrects');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nyc-blue via-blue-800 to-cyan-600 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="flex justify-center text-5xl mb-3">
              <FaMapMarkedAlt className="text-yellow-300" />
            </div>
            <h1 className="text-3xl font-bold text-white">NYC WebSIG</h1>
            <p className="text-white/70 text-sm mt-1">Plateforme cartographique interactive</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-300" />
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                required
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-300" />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400 text-red-100 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-green-500 hover:to-green-600 text-nyc-blue font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg hover:shadow-xl"
            >
              Se connecter
            </button>
          </form>

          <p className="text-white/40 text-xs text-center mt-6">
            (test : admin / admin)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;