import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, MapPin, Activity, CheckCircle, Clock, ArrowRight, TrendingUp
} from 'lucide-react';
import api from '../api';

const Home = ({ user, setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats');
        setStats(res.data);
      } catch (e) {
        console.error("Erreur lors de la récupération des statistiques", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Clock className="animate-spin text-blue-600" /></div>;

  const cards = [
    { label: 'Citoyens Enregistrés', value: stats?.total_citoyens || 0, icon: Users, color: 'bg-blue-500', tab: 'citoyens' },
    { label: 'Actes Indexés', value: stats?.total_actes || 0, icon: FileText, color: 'bg-indigo-500', tab: 'actes' },
    { label: 'Localités', value: stats?.total_localites || 0, icon: MapPin, color: 'bg-emerald-500', tab: 'localites' },
    { label: 'Citoyens Vivants', value: stats?.vivants || 0, icon: Activity, color: 'bg-orange-500', tab: 'citoyens' },
  ];

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ADMINISTRATEUR';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Bonjour, {user.username} !</h2>
          <p className="text-blue-100 font-medium max-w-xl">
            Bienvenue sur le portail de gestion de l'État Civil - Vision 2035. 
            Suivez en temps réel l'évolution du registre national et gérez les demandes des citoyens.
          </p>
          <div className="mt-6 flex gap-3">
            <button 
              onClick={() => setActiveTab('forum')}
              className="bg-white text-blue-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2"
            >
              Consulter les demandes <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <TrendingUp className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/10 rotate-[-15deg]" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4 text-white shadow-lg`}>
              <card.icon size={24} />
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{card.label}</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 uppercase text-sm tracking-widest mb-6 flex items-center gap-2">
            <CheckCircle className="text-green-500" size={18} /> Répartition des Actes
          </h3>
          <div className="space-y-6">
            {[
              { label: 'Naissances', count: stats?.actes_naissance || 0, color: 'bg-blue-500' },
              { label: 'Mariages', count: stats?.actes_mariage || 0, color: 'bg-pink-500' },
              { label: 'Décès', count: stats?.actes_deces || 0, color: 'bg-gray-700' },
            ].map((item, i) => {
              const percentage = stats?.total_actes > 0 ? (item.count / stats.total_actes) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-gray-700">{item.label}</span>
                    <span className="font-black text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`${item.color} h-full transition-all duration-1000`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 uppercase text-sm tracking-widest mb-6 flex items-center gap-2">
             Actions Rapides
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => setActiveTab('citoyens')}
              className="w-full text-left p-4 rounded-xl border border-gray-50 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition-all group"
            >
              <p className="font-bold text-sm group-hover:text-blue-700">Enregistrer un Citoyen</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Nouveau dossier CIN</p>
            </button>
            <button 
              onClick={() => setActiveTab('actes')}
              className="w-full text-left p-4 rounded-xl border border-gray-50 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-100 transition-all group"
            >
              <p className="font-bold text-sm group-hover:text-indigo-700">Indexer un Acte</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Numérisation registre</p>
            </button>
            <button 
              onClick={() => setActiveTab('forum')}
              className="w-full text-left p-4 rounded-xl border border-gray-50 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-100 transition-all group"
            >
              <p className="font-bold text-sm group-hover:text-emerald-700">Demandes en attente</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Validation agents</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
