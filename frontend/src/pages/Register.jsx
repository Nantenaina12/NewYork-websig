import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock, FaEnvelope, FaMapMarkedAlt } from 'react-icons/fa';

// Récupérer l'URL du backend depuis les variables d'environnement
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Utilisation de l'URL dynamique
      await axios.post(`${API_URL}/api/register`, null, {
        params: { username, password, email }
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-500 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="flex justify-center text-5xl mb-3">
              <FaMapMarkedAlt className="text-yellow-300" />
            </div>
            <h1 className="text-3xl font-bold text-white">Créer un compte</h1>
            <p className="text-white/70 text-sm mt-1">Rejoignez la plateforme NYC WebSIG</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-300" />
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-300" />
              <input
                type="email"
                placeholder="Email (optionnel)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-300" />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400 text-red-100 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/20 border border-green-400 text-green-100 p-3 rounded-xl text-sm">
                Inscription réussie ! Redirection vers la connexion...
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 font-bold py-3 px-4 rounded-xl transition"
            >
              S'inscrire
            </button>
          </form>

          <p className="text-white/40 text-xs text-center mt-6">
            Déjà un compte ? <Link to="/login" className="text-yellow-300 hover:underline">Connectez-vous</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;