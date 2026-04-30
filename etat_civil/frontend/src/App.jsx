import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, MapPin, FileText, LogOut, Search, Plus, Trash2, Download, ShieldCheck, User as UserIcon, Menu, X, Pencil, MessageSquare, Home as HomeIcon
} from 'lucide-react';
import api from './api';
import Forum from './components/Forum';
import Home from './components/Home';

// --- LOGIN COMPONENT ---
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { username, password });
      onLogin(res.data); // res.data contains id_utilisateur, username, role, etc.
    } catch (err) {
      setError('Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <ShieldCheck className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Vision 2035</h2>
        <p className="text-center text-gray-500 mb-8">Système National de l'État Civil</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Identifiant</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <input type="password" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- LOCALITES MODULE (FULL CRUD) ---
const Localites = ({ user }) => {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ nom_commune: '', district: '', region: '', code_postal: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchList = async () => {
    try {
      const regionParam = user?.role?.toUpperCase() === 'AGENT' ? `?region=${user.region}` : '';
      const res = await api.get(`/localites${regionParam}`);
      setList(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchList(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/localites/${editingId}`, form);
      } else {
        await api.post('/localites', form);
      }
      setEditingId(null);
      setForm({ nom_commune: '', district: '', region: '', code_postal: '' });
      fetchList();
    } catch (e) { console.error(e); }
  };

  const startEdit = (l) => {
    setEditingId(l.id_localite);
    setForm({ nom_commune: l.nom_commune, district: l.district, region: l.region, code_postal: l.code_postal });
  };

  const del = async (id) => {
    if (confirm('Supprimer cette localité ?')) {
      await api.delete(`/localites/${id}`);
      fetchList();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          {editingId ? <Pencil className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
          {editingId ? 'Modifier Localité' : 'Ajouter Localité'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <input placeholder="Commune" value={form.nom_commune} onChange={e => setForm({...form, nom_commune: e.target.value})} required className="border p-2 rounded-lg text-sm" />
          <input placeholder="District" value={form.district} onChange={e => setForm({...form, district: e.target.value})} required className="border p-2 rounded-lg text-sm" />
          <input placeholder="Région" value={form.region} onChange={e => setForm({...form, region: e.target.value})} required className="border p-2 rounded-lg text-sm" />
          <input placeholder="CP" value={form.code_postal} onChange={e => setForm({...form, code_postal: e.target.value})} required className="border p-2 rounded-lg text-sm" />
          <div className="flex gap-2 sm:col-span-2 md:col-span-1">
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg font-bold flex-1 text-sm">Valider</button>
            {editingId && <button type="button" onClick={() => {setEditingId(null); setForm({nom_commune:'',district:'',region:'',code_postal:''})}} className="bg-gray-200 p-2 rounded-lg font-bold flex-1 text-sm">X</button>}
          </div>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Commune</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">District</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Région</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(l => (
                <tr key={l.id_localite} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-sm">{l.nom_commune}</td>
                  <td className="p-4 text-sm">{l.district}</td>
                  <td className="p-4 text-sm">{l.region}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(l)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={18}/></button>
                      <button onClick={() => del(l.id_localite)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- CITOYENS MODULE (FULL CRUD) ---
const Citoyens = ({ user }) => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nom: '', prenom: '', date_naissance: '', lieu_naissance: '', est_vivant: true, sexe: 'M', numero_cin: '' });

  const fetchList = async (q = '') => {
    try {
      const params = new URLSearchParams();
      if (q) params.append('search', q);
      if (user?.role?.toUpperCase() === 'AGENT' && user.region) {
        params.append('region', user.region);
      }
      const res = await api.get(`/citoyens?${params.toString()}`);
      setList(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchList(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/citoyens/${editingId}`, form);
      } else {
        await api.post('/citoyens', form);
      }
      setEditingId(null);
      setForm({ nom: '', prenom: '', date_naissance: '', lieu_naissance: '', est_vivant: true, sexe: 'M', numero_cin: '' });
      fetchList();
    } catch (e) { console.error(e); }
  };

  const del = async (id) => {
    if (confirm('Supprimer ce citoyen ?')) {
      await api.delete(`/citoyens/${id}`);
      fetchList();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input className="w-full border pl-10 p-2 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Rechercher par NOM..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => fetchList(search)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all">Chercher</button>
      </div>
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          {editingId ? <Pencil className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
          {editingId ? 'Modifier Citoyen' : 'Nouveau Citoyen'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input placeholder="NOM" value={form.nom} onChange={e => setForm({...form, nom: e.target.value.toUpperCase()})} required className="border p-2 rounded-lg text-sm" />
          <input placeholder="Prénom" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} required className="border p-2 rounded-lg text-sm" />
          <input type="date" value={form.date_naissance} onChange={e => setForm({...form, date_naissance: e.target.value})} required className="border p-2 rounded-lg text-sm" />
          <input placeholder="CIN" value={form.numero_cin} onChange={e => setForm({...form, numero_cin: e.target.value})} required className="border p-2 rounded-lg text-sm" />
          <select value={form.sexe} onChange={e => setForm({...form, sexe: e.target.value})} className="border p-2 rounded-lg text-sm font-medium">
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
          <div className="flex items-center gap-2 border p-2 rounded-lg">
            <input type="checkbox" className="w-4 h-4 rounded text-blue-600" checked={form.est_vivant} onChange={e => setForm({...form, est_vivant: e.target.checked})} id="isVivant" />
            <label htmlFor="isVivant" className="text-xs font-bold uppercase tracking-wider text-gray-600">Vivant</label>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg font-bold flex-1 text-sm shadow-sm">Enregistrer</button>
            {editingId && <button type="button" onClick={() => {setEditingId(null); setForm({nom:'',prenom:'',date_naissance:'',lieu_naissance:'',est_vivant:true,sexe:'M',numero_cin:''})}} className="bg-gray-200 p-2 rounded-lg font-bold flex-1 text-gray-700 text-sm">Annuler</button>}
          </div>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Nom complet</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">CIN</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-center">Statut</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(c => (
                <tr key={c.id_citoyen} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-sm">{c.nom}</div>
                    <div className="text-[10px] text-gray-500 font-medium">{c.prenom}</div>
                  </td>
                  <td className="p-4 font-mono text-xs">{c.numero_cin}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${c.est_vivant ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                      {c.est_vivant ? 'VIVANT' : 'DÉCÉDÉ'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => {setEditingId(c.id_citoyen); setForm(c)}} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={18}/></button>
                      <button onClick={() => del(c.id_citoyen)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- ACTES MODULE (FULL CRUD) ---
const Actes = ({ user }) => {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ type_acte: 'NAISSANCE', date_acte: '', numero_registre: '', id_citoyen: '' });

  const fetchList = async () => {
    try {
      const regionParam = user?.role?.toUpperCase() === 'AGENT' && user.region ? `?region=${user.region}` : '';
      const res = await api.get(`/actes${regionParam}`);
      setList(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchList(); }, [user]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/actes/${editingId}`, form);
      } else {
        await api.post('/actes', form);
      }
      setEditingId(null);
      setForm({ type_acte: 'NAISSANCE', date_acte: '', numero_registre: '', id_citoyen: '' });
      fetchList();
    } catch (e) { console.error(e); }
  };

  const del = async (id) => {
    if (confirm('Supprimer cet acte ?')) {
      await api.delete(`/actes/${id}`);
      fetchList();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-xl border shadow-sm">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {editingId ? 'Modifier Acte' : 'Indexer un Acte'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <select value={form.type_acte} onChange={e => setForm({...form, type_acte: e.target.value})} className="border p-2 rounded-lg font-bold text-sm">
            <option value="NAISSANCE">NAISSANCE</option>
            <option value="DECES">DECES</option>
            <option value="MARIAGE">MARIAGE</option>
          </select>
          <input type="date" value={form.date_acte} onChange={e => setForm({...form, date_acte: e.target.value})} required className="border p-2 rounded-lg text-sm" />
          <input placeholder="N° Registre" value={form.numero_registre} onChange={e => setForm({...form, numero_registre: e.target.value})} required className="border p-2 rounded-lg text-sm" />
          <input placeholder="ID Citoyen" value={form.id_citoyen} onChange={e => setForm({...form, id_citoyen: e.target.value})} required className="border p-2 rounded-lg text-sm" />
          <div className="flex gap-2 sm:col-span-2 md:col-span-1">
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg font-bold flex-1 shadow-md hover:bg-blue-700 text-sm">Indexer</button>
            {editingId && <button type="button" onClick={() => {setEditingId(null); setForm({type_acte:'NAISSANCE',date_acte:'',numero_registre:'',id_citoyen:''})}} className="bg-gray-200 p-2 rounded-lg font-bold flex-1 text-gray-700 text-sm">Annuler</button>}
          </div>
        </form>
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Type Officiel</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-center">Exportation</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(a => (
                <tr key={a.id_acte} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-sm text-gray-900">{a.type_acte}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{a.date_acte} • {a.numero_registre}</div>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => window.open(`/api/actes/${a.id_acte}/pdf`, '_blank')} className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all border border-blue-100">
                      <Download className="w-3 h-3" /> PDF
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => {setEditingId(a.id_acte); setForm(a)}} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={18}/></button>
                      <button onClick={() => del(a.id_acte)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- MY ACCOUNT MODULE ---
const MyAccount = ({ user }) => {
  const [myActes, setMyActes] = useState([]);
  const [profile, setProfile] = useState({ nom: '', mot_de_passe: '', role: '', id_localite: null, photo: null });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProfile = async () => {
    const uid = user?.id_utilisateur || user?.id;
    if (!uid) {
      console.error("ID utilisateur non trouvé dans l'objet user:", user);
      return;
    }
    try {
      const res = await api.get(`/users/${uid}`);
      setProfile(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchProfile();
    const cid = user?.id_citoyen;
    if (cid) {
      api.get(`/my-actes/${cid}`).then(res => setMyActes(res.data)).catch(e => console.error(e));
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const uid = user?.id_utilisateur || user?.id;
    if (!uid) {
      setMessage('Session invalide. Veuillez vous reconnecter.');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/users/${uid}`, profile);
      setMessage('Profil mis à jour avec succès !');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
      fetchProfile();
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.detail || 'Erreur lors de la mise à jour.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-600 p-8 rounded-2xl shadow-lg text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-white/20 p-1 rounded-full border border-white/30 backdrop-blur-md overflow-hidden w-24 h-24 flex items-center justify-center">
            {profile.photo ? (
              <img src={profile.photo} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <UserIcon size={40} className="text-white" />
            )}
          </div>
          <div>
            <h3 className="text-3xl font-bold uppercase tracking-tight">{profile.nom || user.username}</h3>
            <p className="text-blue-200 font-bold uppercase text-[10px] tracking-widest">{profile.role || user.role} • ID: {user.id_citoyen || 'Non lié'}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"
        >
          <Pencil size={18} /> {isEditing ? 'Annuler' : 'Modifier Profil'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl font-bold text-center ${message.includes('succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {isEditing ? (
        <div className="bg-white p-6 rounded-xl border shadow-sm animate-in fade-in duration-300">
          <h3 className="font-bold mb-4 uppercase text-sm text-gray-500 tracking-widest">Informations Personnelles</h3>
          <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Photo de Profil</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Identifiant</label>
              <input 
                value={profile.nom} 
                onChange={e => setProfile({...profile, nom: e.target.value})}
                className="w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mot de passe</label>
              <input 
                type="text"
                value={profile.mot_de_passe} 
                onChange={e => setProfile({...profile, mot_de_passe: e.target.value})}
                className="w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Sauvegarder les modifications'}
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold mb-4 uppercase text-sm text-gray-500 tracking-widest">Détails du Compte</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Nom d'utilisateur</p>
                <p className="font-bold text-gray-900">{profile.nom}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Mot de passe</p>
                <p className="font-bold text-gray-900">•••••••• (Visible en mode édition)</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Rôle Système</p>
                <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase mt-1">
                  {profile.role}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold mb-4 uppercase text-sm text-gray-500 tracking-widest">Mes Documents Archivés</h3>
            {myActes.length > 0 ? (
              <div className="space-y-3">
                {myActes.map(a => (
                  <div key={a.id_acte} className="p-4 border rounded-xl flex justify-between items-center bg-gray-50 hover:bg-blue-50 transition-colors">
                    <div><p className="font-bold text-gray-900">{a.type_acte}</p><p className="text-xs text-gray-500">{a.date_acte} • Registre {a.numero_registre}</p></div>
                    <button onClick={() => window.open(`/api/actes/${a.id_acte}/pdf`, '_blank')} className="bg-white p-2 rounded-lg text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-600 hover:text-white transition-all"><Download size={20}/></button>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 italic text-center py-8">Aucun acte trouvé dans les archives pour ce profil.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN APPLICATION ---
const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-close mobile menu on tab change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const role = (user?.role || '').toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'ADMINISTRATEUR';
  const isAgent = role === 'AGENT';

  const menuItems = useMemo(() => [
    { id: 'home', label: 'Accueil', icon: HomeIcon, show: true },
    { id: 'localites', label: 'Localités', icon: MapPin, show: isAdmin },
    { id: 'citoyens', label: 'Citoyens', icon: Users, show: isAdmin || isAgent },
    { id: 'actes', label: 'Actes', icon: FileText, show: isAdmin || isAgent },
    { id: 'forum', label: 'Forum & Demandes', icon: MessageSquare, show: true },
    { id: 'account', label: 'Mon Compte', icon: UserIcon, show: true },
  ], [isAdmin, isAgent]);

  const allowedItems = menuItems.filter(item => item.show);

  useEffect(() => {
    if (user && !activeTab && allowedItems.length > 0) {
      setActiveTab(allowedItems[0].id);
    }
  }, [user, allowedItems, activeTab]);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-[60] flex items-center justify-between px-4">
        <span className="font-black text-xl text-blue-600 italic tracking-tighter">VISION 2035</span>
        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-blue-600 bg-blue-50 rounded-lg">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-[65] backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* NAVIGATION SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-xl
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
      `}>
        <div className="p-6 hidden lg:flex items-center justify-between border-b">
          {isSidebarOpen && <span className="font-black text-2xl text-blue-600 tracking-tighter italic">VISION 2035</span>}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        <div className="lg:hidden p-6 border-b flex justify-between items-center">
          <span className="font-black text-xl text-blue-600 italic">MENU</span>
          <button onClick={() => setMobileMenuOpen(false)}><X size={20}/></button>
        </div>

        <nav className="flex-1 p-3 space-y-2 mt-4 overflow-y-auto">
          {allowedItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all font-bold ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-blue-50'}`}
            >
              <item.icon size={20} className="shrink-0" />
              {(isSidebarOpen || isMobileMenuOpen) && <span className="text-sm uppercase tracking-wider truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t space-y-4">
          <div className={`flex items-center gap-3 ${(isSidebarOpen || isMobileMenuOpen) ? 'px-4' : 'justify-center'} py-2`}>
            <div className="bg-blue-100 p-2 rounded-full shadow-sm shrink-0">
              <UserIcon size={20} className="text-blue-600" />
            </div>
            {(isSidebarOpen || isMobileMenuOpen) && (
              <div className="overflow-hidden">
                <p className="text-sm font-black truncate text-gray-900 uppercase">{user.username}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1 truncate">{role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => { if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) setUser(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-600 hover:bg-red-50 transition-all font-bold ${(isSidebarOpen || isMobileMenuOpen) ? '' : 'justify-center'}`}
          >
            <LogOut size={20} className="shrink-0" />
            {(isSidebarOpen || isMobileMenuOpen) && <span className="text-sm uppercase tracking-wider">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`
        flex-1 transition-all duration-300 min-w-0
        ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
        p-4 md:p-8 mt-16 lg:mt-0
      `}>
        <div className="max-w-7xl mx-auto">
          <header className="mb-6 md:mb-10 border-b pb-4 md:pb-6 border-gray-200">
             <h1 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">
               {menuItems.find(m => m.id === activeTab)?.label || 'Chargement...'}
             </h1>
             <p className="text-gray-400 font-bold uppercase text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] mt-1 italic">Registre National Numérique • République de Madagascar</p>
          </header>
          
          <div className="animate-in fade-in duration-700">
            {activeTab === 'home' && <Home user={user} setActiveTab={setActiveTab} />}
            {activeTab === 'localites' && <Localites user={user} />}
            {activeTab === 'citoyens' && <Citoyens user={user} />}
            {activeTab === 'actes' && <Actes user={user} />}
            {activeTab === 'forum' && <Forum user={user} />}
            {activeTab === 'account' && <MyAccount user={user} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
