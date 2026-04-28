import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, MapPin, FileText, LogOut, Search, Plus, Trash2, Download, ShieldCheck, User as UserIcon, Menu, X, Pencil
} from 'lucide-react';
import api from './api';

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
      onLogin(res.data);
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
const Localites = () => {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ nom_commune: '', district: '', region: '', code_postal: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchList = async () => {
    try {
      const res = await api.get('/localites');
      setList(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchList(); }, []);

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
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          {editingId ? <Pencil className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
          {editingId ? 'Modifier Localité' : 'Ajouter Localité'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input placeholder="Commune" value={form.nom_commune} onChange={e => setForm({...form, nom_commune: e.target.value})} required className="border p-2 rounded-lg" />
          <input placeholder="District" value={form.district} onChange={e => setForm({...form, district: e.target.value})} required className="border p-2 rounded-lg" />
          <input placeholder="Région" value={form.region} onChange={e => setForm({...form, region: e.target.value})} required className="border p-2 rounded-lg" />
          <input placeholder="CP" value={form.code_postal} onChange={e => setForm({...form, code_postal: e.target.value})} required className="border p-2 rounded-lg" />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg font-bold flex-1">Valider</button>
            {editingId && <button type="button" onClick={() => {setEditingId(null); setForm({nom_commune:'',district:'',region:'',code_postal:''})}} className="bg-gray-200 p-2 rounded-lg font-bold flex-1">X</button>}
          </div>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Commune</th>
              <th className="p-4">District</th>
              <th className="p-4">Région</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(l => (
              <tr key={l.id_localite} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{l.nom_commune}</td>
                <td className="p-4">{l.district}</td>
                <td className="p-4">{l.region}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => startEdit(l)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={18}/></button>
                    <button onClick={() => del(l.id_localite)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- CITOYENS MODULE (FULL CRUD) ---
const Citoyens = () => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nom: '', prenom: '', date_naissance: '', lieu_naissance: '', est_vivant: true, sexe: 'M', numero_cin: '' });

  const fetchList = async (q = '') => {
    try {
      const res = await api.get(`/citoyens${q ? `?search=${q}` : ''}`);
      setList(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchList(); }, []);

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
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input className="w-full border pl-10 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Rechercher par NOM..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => fetchList(search)} className="bg-blue-600 text-white px-6 rounded-lg font-bold">Chercher</button>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          {editingId ? <Pencil className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
          {editingId ? 'Modifier Citoyen' : 'Nouveau Citoyen'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input placeholder="NOM" value={form.nom} onChange={e => setForm({...form, nom: e.target.value.toUpperCase()})} required className="border p-2 rounded-lg" />
          <input placeholder="Prénom" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} required className="border p-2 rounded-lg" />
          <input type="date" value={form.date_naissance} onChange={e => setForm({...form, date_naissance: e.target.value})} required className="border p-2 rounded-lg" />
          <input placeholder="CIN" value={form.numero_cin} onChange={e => setForm({...form, numero_cin: e.target.value})} required className="border p-2 rounded-lg" />
          <select value={form.sexe} onChange={e => setForm({...form, sexe: e.target.value})} className="border p-2 rounded-lg">
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
          <div className="flex items-center gap-2 border p-2 rounded-lg">
            <input type="checkbox" checked={form.est_vivant} onChange={e => setForm({...form, est_vivant: e.target.checked})} id="isVivant" />
            <label htmlFor="isVivant" className="text-sm font-bold">Vivant</label>
          </div>
          <div className="flex gap-2 col-span-full md:col-span-1">
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg font-bold flex-1">Enregistrer</button>
            {editingId && <button type="button" onClick={() => {setEditingId(null); setForm({nom:'',prenom:'',date_naissance:'',lieu_naissance:'',est_vivant:true,sexe:'M',numero_cin:''})}} className="bg-gray-200 p-2 rounded-lg font-bold flex-1 text-gray-700">Annuler</button>}
          </div>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Nom complet</th>
              <th className="p-4">CIN</th>
              <th className="p-4 text-center">Statut</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c.id_citoyen} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-bold">{c.nom}</div>
                  <div className="text-xs text-gray-500">{c.prenom}</div>
                </td>
                <td className="p-4 font-mono text-sm">{c.numero_cin}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${c.est_vivant ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.est_vivant ? 'VIVANT' : 'DÉCÉDÉ'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => {setEditingId(c.id_citoyen); setForm(c)}} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={18}/></button>
                    <button onClick={() => del(c.id_citoyen)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- ACTES MODULE (FULL CRUD + PDF) ---
const Actes = () => {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ type_acte: 'NAISSANCE', date_acte: '', numero_registre: '', id_citoyen: '' });

  const fetchList = async () => {
    try {
      const res = await api.get('/actes');
      setList(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchList(); }, []);

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
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {editingId ? 'Modifier Acte' : 'Indexer un Acte'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select value={form.type_acte} onChange={e => setForm({...form, type_acte: e.target.value})} className="border p-2 rounded-lg font-bold">
            <option value="NAISSANCE">NAISSANCE</option>
            <option value="DECES">DECES</option>
            <option value="MARIAGE">MARIAGE</option>
          </select>
          <input type="date" value={form.date_acte} onChange={e => setForm({...form, date_acte: e.target.value})} required className="border p-2 rounded-lg" />
          <input placeholder="N° Registre" value={form.numero_registre} onChange={e => setForm({...form, numero_registre: e.target.value})} required className="border p-2 rounded-lg" />
          <input placeholder="ID Citoyen" value={form.id_citoyen} onChange={e => setForm({...form, id_citoyen: e.target.value})} required className="border p-2 rounded-lg" />
          <div className="flex gap-2 col-span-full md:col-span-1">
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg font-bold flex-1 shadow-md hover:bg-blue-700">Indexer</button>
            {editingId && <button type="button" onClick={() => {setEditingId(null); setForm({type_acte:'NAISSANCE',date_acte:'',numero_registre:'',id_citoyen:''})}} className="bg-gray-200 p-2 rounded-lg font-bold flex-1 text-gray-700">Annuler</button>}
          </div>
        </form>
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Type Officiel</th>
              <th className="p-4 text-center">Exportation</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(a => (
              <tr key={a.id_acte} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-bold text-gray-900">{a.type_acte}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{a.date_acte} • {a.numero_registre}</div>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => window.open(`/api/actes/${a.id_acte}/pdf`, '_blank')} className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1 rounded-full font-bold text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all border border-blue-100">
                    <Download className="w-3 h-3" /> Télécharger PDF
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => {setEditingId(a.id_acte); setForm(a)}} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={18}/></button>
                    <button onClick={() => del(a.id_acte)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MY ACCOUNT MODULE ---
const MyAccount = ({ user }) => {
  const [myActes, setMyActes] = useState([]);
  useEffect(() => {
    if (user.id_citoyen) {
      api.get(`/my-actes/${user.id_citoyen}`).then(res => setMyActes(res.data)).catch(e => console.error(e));
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="bg-blue-600 p-8 rounded-2xl shadow-lg text-white flex items-center gap-6">
        <div className="bg-white/20 p-4 rounded-full border border-white/30 backdrop-blur-md">
          <UserIcon size={40} className="text-white" />
        </div>
        <div>
          <h3 className="text-3xl font-bold uppercase tracking-tight">{user.username}</h3>
          <p className="text-blue-200 font-bold uppercase text-[10px] tracking-widest">{user.role} • ID: {user.id_citoyen || 'Non lié'}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="font-bold mb-4 uppercase text-sm text-gray-500 tracking-widest">Mes Documents Archivés</h3>
        {myActes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  );
};

// --- MAIN APPLICATION ---
const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Normalisation du rôle pour s'assurer que 'administrateur' ou 'ADMIN' fonctionnent
  const role = (user?.role || '').toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'ADMINISTRATEUR';
  const isAgent = role === 'AGENT';

  // Menu dynamique basé sur les permissions
  const menuItems = useMemo(() => [
    { id: 'localites', label: 'Localités', icon: MapPin, show: isAdmin },
    { id: 'citoyens', label: 'Citoyens', icon: Users, show: isAdmin || isAgent },
    { id: 'actes', label: 'Actes', icon: FileText, show: isAdmin || isAgent },
    { id: 'account', label: 'Mon Compte', icon: UserIcon, show: true },
  ], [isAdmin, isAgent]);

  const allowedItems = menuItems.filter(item => item.show);

  // Initialisation de l'onglet actif lors de la connexion
  useEffect(() => {
    if (user && !activeTab && allowedItems.length > 0) {
      setActiveTab(allowedItems[0].id);
    }
  }, [user, allowedItems, activeTab]);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* NAVIGATION SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 z-50 transition-all shadow-lg`}>
        <div className="p-6 flex items-center justify-between border-b">
          {isSidebarOpen && <span className="font-black text-2xl text-blue-600 tracking-tighter italic">VISION 2035</span>}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-2 mt-4">
          {allowedItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all font-bold ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-blue-50'}`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="text-sm uppercase tracking-wider">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t space-y-4">
          <div className={`flex items-center gap-3 ${isSidebarOpen ? 'px-4' : 'justify-center'} py-2`}>
            <div className="bg-blue-100 p-2 rounded-full shadow-sm">
              <UserIcon size={20} className="text-blue-600" />
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-black truncate text-gray-900 uppercase">{user.username}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">{role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => { if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) setUser(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-600 hover:bg-red-50 transition-all font-bold ${isSidebarOpen ? '' : 'justify-center'}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm uppercase tracking-wider">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-8`}>
        <div className="max-w-7xl mx-auto">
          <header className="mb-10 border-b pb-6 border-gray-200">
             <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">
               {menuItems.find(m => m.id === activeTab)?.label || 'Chargement...'}
             </h1>
             <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-1 italic">Registre National Numérique • République de Madagascar</p>
          </header>
          
          <div className="animate-in fade-in duration-700">
            {activeTab === 'localites' && <Localites />}
            {activeTab === 'citoyens' && <Citoyens />}
            {activeTab === 'actes' && <Actes />}
            {activeTab === 'account' && <MyAccount user={user} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
