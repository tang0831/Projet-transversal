import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  FileCheck, 
  Users, 
  Bell, 
  LogOut,
  ChevronRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { getActesAValider, validerActeOfficiel } from './api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [actes, setActes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.role === 'CITOYEN') {
        navigate('/dashboard');
        return;
      }
      setUser(parsed);
      fetchActes();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchActes = async () => {
    try {
      const response = await getActesAValider();
      setActes(response.data);
    } catch (error) {
      console.error("Erreur chargement actes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id) => {
    if (!window.confirm("Voulez-vous valider cet acte officiellement ?")) return;
    try {
      await validerActeOfficiel(id);
      alert("Acte validé avec succès !");
      fetchActes();
    } catch (error) {
      alert("Erreur lors de la validation");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vert"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-8">
          <div className="text-2xl font-black text-vert tracking-tighter">TOKANA-ID</div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Administration</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { icon: ShieldCheck, label: "Vue d'ensemble", active: true },
            { icon: FileCheck, label: "Validations", active: false },
            { icon: Users, label: "Registres", active: false },
            { icon: Search, label: "Recherche", active: false },
          ].map((item, i) => (
            <button 
              key={i} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                item.active ? 'bg-white/10 text-vert' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Espace de Validation</h1>
              <p className="text-gray-500 mt-1 font-medium">Gestion des demandes d'actes d'état civil.</p>
            </div>
            <div className="flex gap-4">
               <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase">En attente</p>
                  <p className="text-2xl font-black text-orange-500">{actes.length}</p>
               </div>
            </div>
          </header>

          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 bg-gray-50/50">
               <h3 className="font-bold text-gray-900 flex items-center gap-2">
                 <Bell size={18} className="text-orange-500" />
                 Demandes à traiter
               </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-8 py-4">Citoyen</th>
                    <th className="px-8 py-4">Type d'Acte</th>
                    <th className="px-8 py-4">Date de Demande</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {actes.length > 0 ? actes.map((acte) => (
                    <tr key={acte.id} className="group hover:bg-gray-50 transition">
                      <td className="px-8 py-6">
                        <div>
                          <p className="font-bold text-gray-900">{acte.nom} {acte.prenom}</p>
                          <p className="text-xs text-gray-400 font-mono">CIN: {acte.numero_cin}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase">
                          {acte.type_acte}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                        {new Date(acte.date_enregistrement).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button 
                            onClick={() => handleValidate(acte.id)}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition shadow-sm"
                            title="Valider officiellement"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition shadow-sm"
                            title="Rejeter"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-medium italic">
                        Aucune demande en attente de validation pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
