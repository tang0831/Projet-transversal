import React from 'react';
import { Users, FileText, Activity, Wifi, WifiOff } from 'lucide-react';

const LegacyHome = ({ user, setActiveTab }) => {
  const isOnline = navigator.onLine;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour et bonne matinée";
    if (hour < 18) return "Ravi de vous revoir en cette après-midi";
    return "Bonsoir, nous sommes ravis de votre visite";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {getGreeting()}, {user.username.split(' ')[0]} !
          </h1>
          <p className="text-sm text-slate-500">Administration Tokana ID - Portail {user.role}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${isOnline ? 'bg-[#007A33]/10 text-[#007A33]' : 'bg-[#FC3D21]/10 text-[#FC3D21]'}`}>
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          {isOnline ? 'EN LIGNE' : 'HORS LIGNE'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 font-bold uppercase text-xs mb-2">Utilisateurs</h3>
          <p className="text-3xl font-black text-[#007A33]">124</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 font-bold uppercase text-xs mb-2">Actes Indexés</h3>
          <p className="text-3xl font-black text-[#007A33]">856</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 font-bold uppercase text-xs mb-2">Demandes en attente</h3>
          <p className="text-3xl font-black text-[#FC3D21]">8</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="font-bold mb-4 uppercase text-sm tracking-widest text-slate-900">Raccourcis Rapides</h2>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('citoyens')} className="bg-[#007A33] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#00642a] transition-all">Gérer Citoyens</button>
          <button onClick={() => setActiveTab('actes')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">Gérer Actes</button>
        </div>
      </div>
    </div>
  );
};

export default LegacyHome;
