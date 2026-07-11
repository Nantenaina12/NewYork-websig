import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock, FaEnvelope, FaMapMarkedAlt } from 'react-icons/fa';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/register', null, {
        params: { username, password, email: email || undefined }
      });
      setSuccess('Compte créé avec succès ! Redirection vers la connexion...');
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
            <p className="text-white/70 text-sm mt-1">Rejoignez la plateforme NYC</p>
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
              <FaEnvelope className="absolute left-3 top-3 text-gray-300" />
              <input
                type="email"
                placeholder="Email (optionnel)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
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
                minLength={4}
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400 text-red-100 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/20 border border-green-400 text-green-100 p-3 rounded-xl text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg hover:shadow-xl"
            >
              S'inscrire
            </button>
          </form>

          <p className="text-white/50 text-sm text-center mt-6">
            Déjà un compte ? <Link to="/login" className="text-yellow-300 hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;