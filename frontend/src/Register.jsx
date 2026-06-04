import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, declarerNaissance } from './api';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom_utilisateur: '',
    mot_de_passe: '',
    role: 'CITOYEN',
    id_localite: 1,
    numero_cin: '',
    nom: '',
    prenom: '',
    date_naissance: '',
    lieu_naissance: '',
    sexe: 'M'
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // 1. Inscrire l'utilisateur
      await register(formData.nom_utilisateur, formData.mot_de_passe, formData.role, formData.id_localite, formData.numero_cin);
      
      // 2. Déclarer la naissance automatiquement
      if (formData.role === 'CITOYEN') {
        await declarerNaissance({
          numero_cin: formData.numero_cin,
          nom: formData.nom,
          prenom: formData.prenom,
          date_naissance: formData.date_naissance,
          lieu_naissance: formData.lieu_naissance,
          sexe: formData.sexe
        });
      }

      alert('Inscription et déclaration de naissance réussies !');
      navigate('/login');
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      alert('Erreur : ' + (error.response?.data?.detail || 'Une erreur est survenue'));
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-6 bg-gray-50 min-h-screen">
      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Formulaire */}
        <div className="w-full p-12 bg-white flex flex-col justify-center">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-gray-900">Inscription</h2>
          </div>
          
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleRegister}>
            <input type="text" placeholder="Nom d'utilisateur" className="p-4 bg-gray-50 rounded-2xl" value={formData.nom_utilisateur} onChange={(e) => setFormData({...formData, nom_utilisateur: e.target.value})} required />
            <input type="password" placeholder="Mot de passe" className="p-4 bg-gray-50 rounded-2xl" value={formData.mot_de_passe} onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})} required />
            <input type="text" placeholder="Numéro CIN" className="p-4 bg-gray-50 rounded-2xl" value={formData.numero_cin} onChange={(e) => setFormData({...formData, numero_cin: e.target.value})} required />
            <input type="text" placeholder="Nom" className="p-4 bg-gray-50 rounded-2xl" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} required />
            <input type="text" placeholder="Prénom" className="p-4 bg-gray-50 rounded-2xl" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} required />
            <input type="date" placeholder="Date naissance" className="p-4 bg-gray-50 rounded-2xl" value={formData.date_naissance} onChange={(e) => setFormData({...formData, date_naissance: e.target.value})} required />
            <input type="text" placeholder="Lieu naissance" className="p-4 bg-gray-50 rounded-2xl" value={formData.lieu_naissance} onChange={(e) => setFormData({...formData, lieu_naissance: e.target.value})} required />
            <select className="p-4 bg-gray-50 rounded-2xl" value={formData.sexe} onChange={(e) => setFormData({...formData, sexe: e.target.value})}>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
            </select>
            
            <button type="submit" className="md:col-span-2 py-4 bg-gray-900 text-white font-bold rounded-2xl">S'inscrire</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
