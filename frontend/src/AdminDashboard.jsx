import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Search, FileCheck, Users, LogOut, CheckCircle2, Trash2, Shield
} from 'lucide-react';
import { getActesAValider, validerActeOfficiel, getAllCitoyens, deleteCitoyen } from './api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('VALIDATIONS');
  const [actes, setActes] = useState([]);
  const [citoyens, setCitoyens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [actesRes, citoyensRes] = await Promise.all([getActesAValider(), getAllCitoyens()]);
      setActes(actesRes.data);
      setCitoyens(citoyensRes.data);
    } catch (error) { console.error("Erreur:", error); }
    finally { setLoading(false); }
  };

  const handleValidate = async (id) => {
    if (!window.confirm("Valider cet acte ?")) return;
    await validerActeOfficiel(id);
    fetchData();
  };

  const handleDelete = async (cin) => {
    if (!window.confirm("Supprimer ce citoyen ?")) return;
    await deleteCitoyen(cin);
    fetchData();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vert"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-8">
            <div className="flex items-center gap-3">
                <img src="/Seal_of_Madagascar.svg.png" alt="Logo" className="w-10 h-10" />
                <div className="text-2xl font-black text-vert tracking-tighter">TOKANA-ID</div>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Administration</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveTab('VALIDATIONS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeTab === 'VALIDATIONS' ? 'bg-vert/10 text-vert' : 'text-gray-500 hover:bg-gray-50'}`}>
            <ShieldCheck size={18} /> Validations
          </button>
          <button onClick={() => setActiveTab('CITOYENS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeTab === 'CITOYENS' ? 'bg-vert/10 text-vert' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Users size={18} /> Citoyens
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
            <button onClick={() => {localStorage.removeItem('user'); navigate('/login');}} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rouge hover:bg-red-50 transition">
                <LogOut size={18} /> Déconnexion
            </button>
        </div>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
            {activeTab === 'VALIDATIONS' && (
            <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black mb-6">Demandes à valider ({actes.length})</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-400 text-xs uppercase font-black">
                            <th className="p-4">Citoyen</th>
                            <th className="p-4">Type</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {actes.map(a => (
                        <tr key={a.id} className="border-t border-gray-50">
                            <td className="p-4 font-bold">{a.nom} {a.prenom}</td>
                            <td className="p-4 text-sm text-gray-600">{a.type_acte}</td>
                            <td className="p-4 text-right"><button onClick={() => handleValidate(a.id)} className="text-vert font-bold hover:underline">Valider</button></td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </section>
            )}

            {activeTab === 'CITOYENS' && (
            <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black mb-6">Gestion des Citoyens ({citoyens.length})</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-400 text-xs uppercase font-black">
                            <th className="p-4">Citoyen</th>
                            <th className="p-4">CIN</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citoyens.map(c => (
                        <tr key={c.numero_cin} className="border-t border-gray-50">
                            <td className="p-4 font-bold">{c.nom} {c.prenom}</td>
                            <td className="p-4 text-sm text-gray-600">{c.numero_cin}</td>
                            <td className="p-4 text-right">
                            <button onClick={() => handleDelete(c.numero_cin)} className="text-rouge font-bold hover:underline">Supprimer</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </section>
            )}
        </div>
      </main>
    </div>
  );
}
