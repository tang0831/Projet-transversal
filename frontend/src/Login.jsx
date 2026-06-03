import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './api';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(username, password);
      const { role, profil_incomplet, numero_cin } = response.data;
      
      // Stocker les infos de session
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        citoyen_id: response.data.citoyen_id,
        username,
        role,
        numero_cin
      }));

      if (role === 'CITOYEN' && profil_incomplet) {
        navigate('/complete-profile');
      } else {
        navigate(role === 'CITOYEN' ? '/dashboard' : '/admin');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      alert('Erreur : ' + (error.response?.data?.detail || 'Une erreur est survenue'));
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Partie gauche - Branding */}
        <div className="w-full md:w-1/2 bg-vert-light p-12 flex flex-col justify-center relative overflow-hidden">
          {/* Décorations discrètes */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(0,126,58,0.05),transparent)]"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-vert/10 flex items-center justify-center mb-8">
              <img 
                src="/21808444-agitant-drapeau-de-madagascar-sur-mat-de-drapeau-modele-pour-independance-journee-vectoriel.webp" 
                alt="Drapeau Madagascar" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">
              Sécurisez votre <br />
              <span className="text-vert">Identité Civile.</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">
              Accédez à vos documents officiels en un clic. Simple, rapide et 100% souverain.
            </p>
          </div>
        </div>

        {/* Partie droite - Formulaire */}
        <div className="w-full md:w-1/2 p-12 bg-white flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-2xl font-black text-gray-900">Bienvenue</h2>
            <p className="text-gray-400 font-medium">Connectez-vous à votre espace personnel</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Nom d'utilisateur</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vert/20 focus:border-vert transition text-gray-800 placeholder-gray-400 font-medium"
                  placeholder="ex: andry_2026"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Mot de passe</label>
                <input
                  type="password"
                  required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vert/20 focus:border-vert transition text-gray-800 placeholder-gray-400 font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition duration-300 shadow-xl shadow-gray-200 transform hover:-translate-y-0.5"
            >
              Se connecter
            </button>
          </form>
          
          <p className="mt-10 text-center text-sm font-medium text-gray-400">
            Pas encore de compte ?{' '}
            <button onClick={() => navigate('/register')} className="font-bold text-vert hover:underline">
              Créer un accès
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
