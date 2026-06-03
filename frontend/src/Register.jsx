import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from './api';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom_utilisateur: '',
    mot_de_passe: '',
    role: 'AGENT',
    id_localite: 1,
    numero_cin: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(formData.nom_utilisateur, formData.mot_de_passe, formData.role, formData.id_localite, formData.numero_cin);
      alert('Inscription réussie !');
      navigate('/login');
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      alert('Erreur : ' + (error.response?.data?.detail || 'Une erreur est survenue'));
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Partie gauche - Branding */}
        <div className="w-full md:w-1/2 bg-vert-light p-12 flex flex-col justify-center relative overflow-hidden text-center md:text-left">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(0,126,58,0.05),transparent)]"></div>
          
          <div className="relative z-10 flex flex-col items-center md:items-start">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-vert/10 flex items-center justify-center mb-8">
              <img 
                src="/21808444-agitant-drapeau-de-madagascar-sur-mat-de-drapeau-modele-pour-independance-journee-vectoriel.webp" 
                alt="Drapeau Madagascar" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">
              Rejoignez la <br />
              <span className="text-vert">Vision 2035.</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">
              Créez votre compte pour accéder aux services d'identité numérique souverains.
            </p>
          </div>
        </div>

        {/* Partie droite - Formulaire */}
        <div className="w-full md:w-1/2 p-12 bg-white flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl font-black text-gray-900">Inscription</h2>
            <p className="text-gray-400 font-medium">Créez vos accès sécurisés</p>
          </div>
          
          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Nom d'utilisateur" 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vert/20 focus:border-vert transition text-gray-900 placeholder-gray-400 font-medium" 
                value={formData.nom_utilisateur}
                onChange={(e) => setFormData({...formData, nom_utilisateur: e.target.value})} 
                required 
              />
              <input 
                type="password" 
                placeholder="Mot de passe" 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vert/20 focus:border-vert transition text-gray-900 placeholder-gray-400 font-medium" 
                value={formData.mot_de_passe}
                onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})} 
                required 
              />
              <input 
                type="text" 
                placeholder="Numéro CIN" 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vert/20 focus:border-vert transition text-gray-900 placeholder-gray-400 font-medium" 
                value={formData.numero_cin}
                onChange={(e) => setFormData({...formData, numero_cin: e.target.value})} 
                required 
              />
              
              <div className="relative">
                <select 
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vert/20 focus:border-vert transition text-gray-900 font-medium appearance-none"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="CITOYEN">Citoyen (Consultation)</option>
                  <option value="AGENT">Agent (Saisie)</option>
                  <option value="OFFICIER">Officier (Validation)</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition duration-300 shadow-xl shadow-gray-200 transform hover:-translate-y-0.5 mt-4"
            >
              S'inscrire
            </button>
          </form>
          
          <p className="mt-10 text-center text-sm font-medium text-gray-400">
            Déjà inscrit ?{' '}
            <button onClick={() => navigate('/login')} className="font-bold text-vert hover:underline">
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
