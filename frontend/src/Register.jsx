import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, ShieldCheck } from 'lucide-react';
import { register, declarerNaissance, getCitoyen } from './api';

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
    sexe: 'M',
    cin_pere: '',
    cin_mere: ''
  });

  const [parentsInfo, setParentsInfo] = useState({ pere: null, mere: null });
  const [searching, setSearching] = useState({ pere: false, mere: false });

  // Recherche dynamique des parents
  useEffect(() => {
    const searchParent = async (cin, type) => {
      if (cin && cin.length >= 3) {
        setSearching(prev => ({ ...prev, [type]: true }));
        try {
          const res = await getCitoyen(cin);
          setParentsInfo(prev => ({ ...prev, [type]: res.data }));
        } catch (e) {
          setParentsInfo(prev => ({ ...prev, [type]: 'NOT_FOUND' }));
        } finally {
          setSearching(prev => ({ ...prev, [type]: false }));
        }
      } else {
        setParentsInfo(prev => ({ ...prev, [type]: null }));
        setSearching(prev => ({ ...prev, [type]: false }));
      }
    };

    const timer = setTimeout(() => {
        searchParent(formData.cin_pere, 'pere');
        searchParent(formData.cin_mere, 'mere');
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.cin_pere, formData.cin_mere]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(formData.nom_utilisateur, formData.mot_de_passe, formData.role, formData.id_localite, formData.numero_cin);
      
      if (formData.role === 'CITOYEN') {
        await declarerNaissance({
          numero_cin: formData.numero_cin,
          nom: formData.nom,
          prenom: formData.prenom,
          date_naissance: formData.date_naissance,
          lieu_naissance: formData.lieu_naissance,
          sexe: formData.sexe,
          cin_pere: formData.cin_pere || null,
          cin_mere: formData.cin_mere || null
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
    <div className="flex items-center justify-center py-20 px-6 bg-gray-50 min-h-screen font-sans">
      <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Sidebar Info */}
        <div className="md:w-1/3 bg-gray-900 p-12 text-white flex flex-col justify-between">
            <div>
                <img src="/Seal_of_Madagascar.svg.png" alt="Logo" className="w-16 h-16 mb-8 bg-white/10 p-2 rounded-2xl" />
                <h2 className="text-4xl font-black mb-6 leading-tight">Rejoignez la souveraineté numérique.</h2>
                <p className="text-gray-400 text-lg">Créez votre identité sécurisée en quelques minutes. Un compte unique pour tous vos services d'état civil.</p>
            </div>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-vert/20 rounded-2xl flex items-center justify-center text-vert"><ShieldCheck /></div>
                    <p className="font-bold text-sm">Données cryptées</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400"><UserPlus /></div>
                    <p className="font-bold text-sm">Inscription rapide</p>
                </div>
            </div>
        </div>

        {/* Formulaire */}
        <div className="flex-1 p-12">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-gray-900">Nouvelle Inscription</h2>
            <p className="text-gray-500 font-bold mt-2">Veuillez remplir vos informations officielles.</p>
          </div>
          
          <form className="space-y-8" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">Identifiants</label>
                    <input type="text" placeholder="Nom d'utilisateur" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-vert/20 transition outline-none font-bold" value={formData.nom_utilisateur} onChange={(e) => setFormData({...formData, nom_utilisateur: e.target.value})} required />
                    <input type="password" placeholder="Mot de passe" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-vert/20 transition outline-none font-bold mt-4" value={formData.mot_de_passe} onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})} required />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">État Civil</label>
                    <input type="text" placeholder="Numéro CIN" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-vert/20 transition outline-none font-bold" value={formData.numero_cin} onChange={(e) => setFormData({...formData, numero_cin: e.target.value})} required />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <input type="text" placeholder="Nom" className="p-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-vert/20 transition outline-none font-bold" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} required />
                        <input type="text" placeholder="Prénom" className="p-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-vert/20 transition outline-none font-bold" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} required />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">Date de Naissance</label>
                    <input type="date" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] font-bold outline-none" value={formData.date_naissance} onChange={(e) => setFormData({...formData, date_naissance: e.target.value})} required />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">Lieu</label>
                    <input type="text" placeholder="Lieu" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] font-bold outline-none" value={formData.lieu_naissance} onChange={(e) => setFormData({...formData, lieu_naissance: e.target.value})} required />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">Sexe</label>
                    <select className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] font-bold outline-none" value={formData.sexe} onChange={(e) => setFormData({...formData, sexe: e.target.value})}>
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                    </select>
                </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><Search size={20} className="text-vert" /> Filiation (Parents)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="relative">
                            <input type="text" placeholder="CIN du Père" className="w-full p-5 bg-white border border-gray-200 rounded-2xl font-bold outline-none pr-12" value={formData.cin_pere} onChange={(e) => setFormData({...formData, cin_pere: e.target.value})} />
                            <Search className={`absolute right-5 top-5 ${searching.pere ? 'text-vert animate-pulse' : 'text-gray-300'}`} size={20} />
                        </div>
                        {searching.pere && <p className="text-[10px] text-vert font-bold animate-pulse ml-4 uppercase">Recherche en cours...</p>}
                        {parentsInfo.pere && parentsInfo.pere !== 'NOT_FOUND' && (
                            <div className="p-4 bg-vert/5 border border-vert/20 rounded-2xl flex items-center gap-3">
                                <div className="w-2 h-2 bg-vert rounded-full"></div>
                                <span className="text-xs font-black text-vert uppercase">{parentsInfo.pere.nom} {parentsInfo.pere.prenom}</span>
                            </div>
                        )}
                        {parentsInfo.pere === 'NOT_FOUND' && <p className="text-[10px] text-rouge font-bold ml-4 uppercase tracking-tighter">Citoyen introuvable</p>}
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <input type="text" placeholder="CIN de la Mère" className="w-full p-5 bg-white border border-gray-200 rounded-2xl font-bold outline-none pr-12" value={formData.cin_mere} onChange={(e) => setFormData({...formData, cin_mere: e.target.value})} />
                            <Search className={`absolute right-5 top-5 ${searching.mere ? 'text-vert animate-pulse' : 'text-gray-300'}`} size={20} />
                        </div>
                        {searching.mere && <p className="text-[10px] text-vert font-bold animate-pulse ml-4 uppercase">Recherche en cours...</p>}
                        {parentsInfo.mere && parentsInfo.mere !== 'NOT_FOUND' && (
                            <div className="p-4 bg-vert/5 border border-vert/20 rounded-2xl flex items-center gap-3">
                                <div className="w-2 h-2 bg-vert rounded-full"></div>
                                <span className="text-xs font-black text-vert uppercase">{parentsInfo.mere.nom} {parentsInfo.mere.prenom}</span>
                            </div>
                        )}
                        {parentsInfo.mere === 'NOT_FOUND' && <p className="text-[10px] text-rouge font-bold ml-4 uppercase tracking-tighter">Citoyen introuvable</p>}
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 font-bold mt-4 uppercase tracking-widest text-center italic">Les parents doivent déjà être enregistrés dans le système.</p>
            </div>
            
            <button type="submit" className="w-full py-5 bg-gray-900 text-white font-black text-lg rounded-[1.5rem] hover:bg-black transition shadow-xl shadow-gray-900/20">Créer mon compte officiel</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
