import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { creerCitoyen } from './api';

function ProfileCompletion() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    lieu_naissance: '',
    sexe: 'M',
    profession: '',
    domicile: '',
    id_localite: 1
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser.numero_cin) {
        console.warn("CIN manquant dans la session. Redirection...");
        navigate('/login');
        return;
      }
      setUser(parsedUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleComplete = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        numero_cin: user.numero_cin
      };
      console.log('Envoi du profil:', payload);
      await creerCitoyen(payload);
      alert('Profil complété avec succès !');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur complétion profil:', error);
      const detail = error.response?.data?.detail;
      const message = typeof detail === 'string' 
        ? detail 
        : (Array.isArray(detail) ? detail.map(d => `${d.loc[1]}: ${d.msg}`).join(', ') : 'Une erreur est survenue');
      alert('Erreur : ' + message);
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-6 bg-gray-50">
      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Partie gauche - Branding */}
        <div className="w-full md:w-1/2 bg-vert-light p-12 flex flex-col justify-center relative overflow-hidden text-center md:text-left">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(0,126,58,0.05),transparent)]"></div>
          
          <div className="relative z-10 flex flex-col items-center md:items-start">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-vert/10 flex items-center justify-center mb-8">
               <div className="w-10 h-10 bg-vert rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">
              Finalisez votre <br />
              <span className="text-vert">Profil ID.</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">
              Quelques informations supplémentaires pour garantir la sécurité de votre identité souveraine.
            </p>
          </div>
        </div>

        {/* Partie droite - Formulaire */}
        <div className="w-full md:w-1/2 p-12 bg-white flex flex-col justify-center overflow-y-auto max-h-[80vh]">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-black text-gray-900">Complétion</h2>
            <p className="text-gray-400 font-medium tracking-tight">Informations de citoyenneté (CIN: {user?.numero_cin})</p>
          </div>
          
          <form onSubmit={handleComplete} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vert/20 focus:border-vert transition text-gray-900 font-medium placeholder-gray-400" 
                type="text" placeholder="Nom" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} required 
              />
              <input 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vert/20 focus:border-vert transition text-gray-900 font-medium placeholder-gray-400" 
                type="text" placeholder="Prénoms" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} required 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vert/20 focus:border-vert transition text-gray-900 font-medium" 
                type="date" value={formData.date_naissance} onChange={(e) => setFormData({...formData, date_naissance: e.target.value})} required 
              />
              <select 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vert/20 focus:border-vert transition text-gray-900 font-medium appearance-none"
                value={formData.sexe} onChange={(e) => setFormData({...formData, sexe: e.target.value})}
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>

            <input 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vert/20 focus:border-vert transition text-gray-900 font-medium placeholder-gray-400" 
              type="text" placeholder="Lieu de naissance" value={formData.lieu_naissance} onChange={(e) => setFormData({...formData, lieu_naissance: e.target.value})} required 
            />

            <input 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vert/20 focus:border-vert transition text-gray-900 font-medium placeholder-gray-400" 
              type="text" placeholder="Profession" value={formData.profession} onChange={(e) => setFormData({...formData, profession: e.target.value})} required 
            />

            <input 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vert/20 focus:border-vert transition text-gray-900 font-medium placeholder-gray-400" 
              type="text" placeholder="Domicile actuel" value={formData.domicile} onChange={(e) => setFormData({...formData, domicile: e.target.value})} required 
            />
            
            <button 
              type="submit" 
              className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition duration-300 shadow-xl shadow-gray-200 transform hover:-translate-y-0.5 mt-4"
            >
              Finaliser mon identité
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileCompletion;
