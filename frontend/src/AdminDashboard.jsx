import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Search, FileCheck, Users, LogOut, CheckCircle2, XCircle, Trash2, Edit 
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

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-8">
        <div className="text-2xl font-black text-vert mb-10">TOKANA-ID</div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('VALIDATIONS')} className={`w-full p-4 rounded-xl font-bold ${activeTab === 'VALIDATIONS' ? 'bg-white/10' : ''}`}>Validations</button>
          <button onClick={() => setActiveTab('CITOYENS')} className={`w-full p-4 rounded-xl font-bold ${activeTab === 'CITOYENS' ? 'bg-white/10' : ''}`}>Citoyens</button>
        </nav>
        <button onClick={() => {localStorage.removeItem('user'); navigate('/login');}} className="p-4 text-red-400 font-bold">Déconnexion</button>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        {activeTab === 'VALIDATIONS' && (
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black mb-6">Demandes à valider ({actes.length})</h2>
            <table className="w-full">
              <tbody>
                {actes.map(a => (
                  <tr key={a.id} className="border-b">
                    <td className="p-4">{a.nom} {a.prenom}</td>
                    <td className="p-4">{a.type_acte}</td>
                    <td className="p-4"><button onClick={() => handleValidate(a.id)} className="text-green-600"><CheckCircle2 /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'CITOYENS' && (
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black mb-6">Gestion des Citoyens ({citoyens.length})</h2>
            <table className="w-full">
              <tbody>
                {citoyens.map(c => (
                  <tr key={c.numero_cin} className="border-b">
                    <td className="p-4">{c.nom} {c.prenom}</td>
                    <td className="p-4">{c.numero_cin}</td>
                    <td className="p-4">
                      <button onClick={() => handleDelete(c.numero_cin)} className="text-red-600"><Trash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}
