import React, { useState, useEffect } from 'react';
import { Send, FilePlus, CheckCircle, Clock, XCircle, MessageSquare } from 'lucide-react';
import api from '../api';

const Forum = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showDemandeForm, setShowDemandeForm] = useState(false);
  const [typeActe, setTypeActe] = useState('NAISSANCE');

  const isAgent = user?.role?.toUpperCase() === 'AGENT' || user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ADMINISTRATEUR';

  const fetchData = async () => {
    try {
      const msgRes = await api.get('/forum/messages');
      setMessages(msgRes.data);

      const demRes = await api.get(`/demandes${isAgent ? '' : `?id_utilisateur=${user.id_utilisateur}`}`);
      setDemandes(demRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user, isAgent]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await api.post('/forum/messages', { id_utilisateur: user.id_utilisateur, contenu: newMessage });
      setNewMessage('');
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleCreateDemande = async (e) => {
    e.preventDefault();
    try {
      await api.post('/demandes', { id_utilisateur: user.id_utilisateur, type_acte: typeActe });
      setShowDemandeForm(false);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/demandes/${id}`, { statut: status });
      fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-250px)]">
      {/* Forum Discussion */}
      <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <MessageSquare className="text-blue-600" />
          <h3 className="font-bold uppercase text-sm tracking-widest">Forum de Discussion</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div key={m.id_message} className={`flex flex-col ${m.username === user.username ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${m.username === user.username ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                <p className="text-xs font-bold mb-1 opacity-70">{m.username} ({m.role})</p>
                <p className="text-sm">{m.contenu}</p>
                <p className="text-[10px] mt-1 opacity-50 text-right">{new Date(m.date_envoi).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
          <input 
            value={newMessage} 
            onChange={e => setNewMessage(e.target.value)}
            className="flex-1 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Écrivez un message..."
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors">
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* Demandes Section */}
      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold uppercase text-sm tracking-widest">Demandes d'Actes</h3>
            {!isAgent && (
              <button 
                onClick={() => setShowDemandeForm(!showDemandeForm)}
                className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FilePlus size={20} />
              </button>
            )}
          </div>

          {showDemandeForm && (
            <form onSubmit={handleCreateDemande} className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100 animate-in slide-in-from-top duration-300">
              <label className="block text-xs font-bold text-blue-700 uppercase mb-2">Type d'acte souhaité</label>
              <select 
                value={typeActe} 
                onChange={e => setTypeActe(e.target.value)}
                className="w-full border rounded-lg p-2 mb-3 bg-white"
              >
                <option value="NAISSANCE">Acte de Naissance</option>
                <option value="MARIAGE">Acte de Mariage</option>
                <option value="DECES">Acte de Décès</option>
              </select>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">
                Envoyer la demande
              </button>
            </form>
          )}

          <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
            {demandes.length === 0 && <p className="text-center text-gray-400 italic text-sm py-4">Aucune demande en cours</p>}
            {demandes.map((d) => (
              <div key={d.id_demande} className="p-4 border rounded-xl bg-gray-50 hover:bg-white transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{d.type_acte}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{isAgent ? `Par: ${d.username}` : new Date(d.date_demande).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    d.statut === 'VALIDEE' ? 'bg-green-100 text-green-700' : 
                    d.statut === 'REJETEE' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {d.statut}
                  </span>
                </div>
                {isAgent && d.statut === 'EN_ATTENTE' && (
                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleUpdateStatus(d.id_demande, 'VALIDEE')} className="flex-1 bg-green-600 text-white p-1.5 rounded-lg flex justify-center hover:bg-green-700">
                      <CheckCircle size={16} />
                    </button>
                    <button onClick={() => handleUpdateStatus(d.id_demande, 'REJETEE')} className="flex-1 bg-red-600 text-white p-1.5 rounded-lg flex justify-center hover:bg-red-700">
                      <XCircle size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;
