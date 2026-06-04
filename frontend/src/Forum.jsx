import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MessageSquare, Send } from 'lucide-react';
import { getMessages, postMessage } from './api';

export default function Forum() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  
  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    // Supposons que l'utilisateur a id_localite dans son profil
    const response = await getMessages(user?.id_localite || 1); 
    setMessages(response.data);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    await postMessage({ message: newMessage, id_utilisateur: user.id });
    setNewMessage("");
    fetchMessages();
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-100">
      <h2 className="text-2xl font-black mb-6">Forum de District</h2>
      <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-2xl">
        {messages.map(m => (
          <div key={m.id} className="p-3 bg-white rounded-xl shadow-sm">
            <p className="text-xs font-bold text-vert">{m.nom_utilisateur}</p>
            <p className="text-sm">{m.message}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input className="flex-1 px-4 py-3 bg-gray-50 rounded-2xl" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Écrire un message..." />
        <button className="p-4 bg-vert text-white rounded-2xl"><Send size={20} /></button>
      </form>
    </div>
  );
}
