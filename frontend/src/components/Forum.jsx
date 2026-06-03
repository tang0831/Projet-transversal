import { useState, useEffect } from "react";
import {
  Send,
  FilePlus,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  FileText,
  Download,
  Search,
} from "lucide-react";
import api from "../api";

const Forum = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showDemandeForm, setShowDemandeForm] = useState(false);
  const [typeActe, setTypeActe] = useState("NAISSANCE");
  const [formData, setFormData] = useState({
    nom_complet: "",
    date_naissance: "",
    lieu_naissance: "",
    nom_pere: "",
    prof_pere: "",
    date_nais_pere: "",
    nom_mere: "",
    prof_mere: "",
    date_nais_mere: "",
    adresse: "",
    profession_demandeur: ""
  });
  const [searchTerm, setSearchTerm] = useState("");

  const isAgent =
    user?.role?.toUpperCase() === "AGENT" ||
    user?.role?.toUpperCase() === "ADMIN" ||
    user?.role?.toUpperCase() === "ADMINISTRATEUR";

  const fetchData = async () => {
    try {
      const district = user?.district || "Analamanga";
      const msgRes = await api.get(`/forum/messages?district=${district}`);
      setMessages(msgRes.data);

      let url = "/demandes";
      if (!isAgent) {
        url = `/demandes?id_utilisateur=${user.id_utilisateur}`;
      }
      const demRes = await api.get(url);
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
      await api.post("/forum/messages", {
        id_utilisateur: user.id_utilisateur,
        contenu: newMessage,
      });
      setNewMessage("");
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDemande = async (e) => {
    e.preventDefault();
    try {
      await api.post("/demandes", {
        id_utilisateur: user.id_utilisateur,
        type_acte: typeActe,
        ...formData
      });
      setShowDemandeForm(false);
      setFormData({
        nom_complet: "",
        date_naissance: "",
        lieu_naissance: "",
        nom_pere: "",
        prof_pere: "",
        date_nais_pere: "",
        nom_mere: "",
        prof_mere: "",
        date_nais_mere: "",
        adresse: "",
        profession_demandeur: ""
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/demandes/${id}`, { statut: status });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.contenu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.username?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const enAttenteCount = demandes.filter(
    (d) => d.statut === "EN_ATTENTE",
  ).length;
  const valideesCount = demandes.filter((d) => d.statut === "VALIDEE").length;

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)] p-1 text-slate-800">
      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Dossiers
            </p>
            <p className="text-xl font-black text-slate-800">
              {demandes.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              En cours d'examen
            </p>
            <p className="text-xl font-black text-slate-800">
              {enAttenteCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Actes Délivrés
            </p>
            <p className="text-xl font-black text-slate-800">{valideesCount}</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* DISCUSSION ZONE */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-[#007A33] w-5 h-5" />
              <h3 className="font-bold uppercase text-xs tracking-wider text-slate-700">
                Forum ({user?.district || "Analamanga"})
              </h3>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs max-w-xs w-full focus-within:border-[#007A33] focus-within:ring-2 focus-within:ring-[#007A33]/10 transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-0 outline-none w-full text-slate-700"
              />
            </div>
          </div>

          {/* Messages de discussion corrigés */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
            {filteredMessages.map((m) => {
              const isMe = m.username === user.username;
              const isAdminMsg =
                m.role?.toUpperCase() === "ADMIN" ||
                m.role?.toUpperCase() === "AGENT";

              return (
                <div
                  key={m.id_message}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"} w-full`}
                >
                  {/* Meta (Auteur) aligné correctement au-dessus du bloc */}
                  <div className="text-[11px] font-bold text-slate-400 mb-1 px-1">
                    <span
                      className={
                        isMe
                          ? "text-slate-600"
                          : isAdminMsg
                            ? "text-red-500"
                            : "text-slate-700"
                      }
                    >
                      {isMe ? "Vous" : m.username || "Utilisateur"}
                    </span>
                    <span className="text-[9px] font-medium opacity-60 font-mono ml-1">
                      ({m.role || "Citoyen"})
                    </span>
                  </div>

                  {/* La bulle */}
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-xs ${
                      isMe
                        ? "bg-[#007A33] text-white rounded-tr-none font-medium"
                        : isAdminMsg
                          ? "bg-amber-50 border border-amber-200 text-slate-800 rounded-tl-none"
                          : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {m.contenu}
                    </p>
                  </div>

                  {/* Heure */}
                  <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                    {m.date_envoi
                      ? new Date(m.date_envoi).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Formulaire de saisie réajusté */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-100 bg-white shrink-0"
          >
            <div className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 focus-within:border-[#007A33] focus-within:ring-2 focus-within:ring-[#007A33]/10 transition-all">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-transparent border-0 outline-none py-2 text-sm text-slate-800 placeholder-slate-400"
                placeholder="Posez votre question administrative..."
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-[#007A33] text-white p-2 rounded-lg hover:bg-[#00642a] transition-all disabled:opacity-40 shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* DEMANDES D'ACTES COLUMN */}
        <div className="flex flex-col bg-white rounded-2xl shadow-xs border border-slate-200 p-5 overflow-hidden">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="font-bold uppercase text-xs tracking-wider text-slate-700">
              Suivi des Demandes
            </h3>
            {!isAgent && (
              <button
                onClick={() => setShowDemandeForm(!showDemandeForm)}
                className={`p-2 rounded-lg transition-all ${showDemandeForm ? "bg-red-50 text-red-500" : "bg-green-50 text-[#007A33] hover:bg-green-100"}`}
              >
                <FilePlus size={18} />
              </button>
            )}
          </div>

          {showDemandeForm && (
            <form
              onSubmit={handleCreateDemande}
              className="mb-4 p-4 bg-green-50/50 rounded-xl border border-green-100/70 shrink-0 space-y-3 overflow-y-auto max-h-[400px]"
            >
              <label className="block text-[11px] font-bold text-[#007A33] uppercase tracking-wider">
                Type d'acte requis
              </label>
              <select
                value={typeActe}
                onChange={(e) => setTypeActe(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 bg-white text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="NAISSANCE"> Acte de Naissance</option>
                <option value="MARIAGE"> Acte de Mariage</option>
                <option value="DECES"> Acte de Décès</option>
              </select>

              <div className="space-y-2">
                <input placeholder="Nom complet" value={formData.nom_complet} onChange={e => setFormData({...formData, nom_complet: e.target.value})} className="w-full border rounded-lg p-2 text-xs" required />
                <div className="flex gap-2">
                  <input type="date" value={formData.date_naissance} onChange={e => setFormData({...formData, date_naissance: e.target.value})} className="flex-1 border rounded-lg p-2 text-xs" required />
                  <input placeholder="Lieu de naissance" value={formData.lieu_naissance} onChange={e => setFormData({...formData, lieu_naissance: e.target.value})} className="flex-1 border rounded-lg p-2 text-xs" required />
                </div>
                
                <p className="text-[10px] font-black text-slate-400 uppercase mt-2">Information du Père</p>
                <input placeholder="Nom du père" value={formData.nom_pere} onChange={e => setFormData({...formData, nom_pere: e.target.value})} className="w-full border rounded-lg p-2 text-xs" />
                <div className="flex gap-2">
                  <input type="date" value={formData.date_nais_pere} onChange={e => setFormData({...formData, date_nais_pere: e.target.value})} className="flex-1 border rounded-lg p-2 text-xs" title="Date de naissance du père" />
                  <input placeholder="Profession père" value={formData.prof_pere} onChange={e => setFormData({...formData, prof_pere: e.target.value})} className="flex-1 border rounded-lg p-2 text-xs" />
                </div>

                <p className="text-[10px] font-black text-slate-400 uppercase mt-2">Information de la Mère</p>
                <input placeholder="Nom de la mère" value={formData.nom_mere} onChange={e => setFormData({...formData, nom_mere: e.target.value})} className="w-full border rounded-lg p-2 text-xs" />
                <div className="flex gap-2">
                  <input type="date" value={formData.date_nais_mere} onChange={e => setFormData({...formData, date_nais_mere: e.target.value})} className="flex-1 border rounded-lg p-2 text-xs" title="Date de naissance de la mère" />
                  <input placeholder="Profession mère" value={formData.prof_mere} onChange={e => setFormData({...formData, prof_mere: e.target.value})} className="flex-1 border rounded-lg p-2 text-xs" />
                </div>

                <p className="text-[10px] font-black text-slate-400 uppercase mt-2">Autres détails</p>
                <input placeholder="Adresse de domicile" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} className="w-full border rounded-lg p-2 text-xs" required />
                <input placeholder="Votre profession" value={formData.profession_demandeur} onChange={e => setFormData({...formData, profession_demandeur: e.target.value})} className="w-full border rounded-lg p-2 text-xs" />
              </div>

              <button
                type="submit"
                className="w-full bg-[#007A33] text-white py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#00642a] transition-all"
              >
                Soumettre le dossier
              </button>
            </form>
          )}

          {/* Liste corrigée pour d.type ou d.type_acte */}
          <div className="space-y-3 overflow-y-auto pr-1 flex-1📐">
            {demandes.length === 0 && (
              <div className="text-center py-8 text-slate-400 italic text-xs">
                Aucune demande en cours
              </div>
            )}
            {demandes.map((d) => {
              // Gestion sécurisée du libellé si l'attribut est 'type' ou 'type_acte'
              const displayType = d.type || d.type_acte || "Non spécifié";

              return (
                <div
                  key={d.id}
                  className="p-3.5 border border-slate-100 bg-slate-50/40 rounded-xl hover:bg-white hover:border-slate-200 transition-all shadow-xs group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      {/* Affichage corrigé de la casse */}
                      <p className="font-bold text-sm text-slate-800 tracking-tight capitalize">
                        Acte de {displayType.toLowerCase()}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {isAgent
                          ? `Citoyen: ${d.citoyen_nom || "Inconnu"} ${d.citoyen_prenom || ""} (CIN: ${d.citoyen_cin || "N/A"})`
                          : d.date || d.date_demande
                            ? new Date(d.date || d.date_demande).toLocaleDateString()
                            : "Date inconnue"}
                      </p>
                    </div>


                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        d.statut === "VALIDEE"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : d.statut === "REJETEE"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}
                    >
                      {d.statut}
                    </span>
                  </div>

                  {!isAgent && d.statut === "VALIDEE" && (
                    <button
                      onClick={() =>
                        window.open(`/api/actes/${d.id}/pdf?user_id=${user.id_utilisateur}`, '_blank')
                      }
                      className="mt-2 w-full bg-slate-100 hover:bg-[#007A33]/10 hover:text-[#007A33] text-slate-600 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Télécharger mon
                      Extrait
                    </button>

                  )}

                  {isAgent && d.statut === "EN_ATTENTE" && (
                    <div className="flex gap-2 mt-3 pt-2.5 border-t border-slate-100">
                      <button
                        onClick={() => handleUpdateStatus(d.id, "VALIDEE")}
                        className="flex-1 bg-green-600 text-white py-1 rounded-lg flex justify-center hover:bg-green-700"
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(d.id, "REJETEE")}
                        className="flex-1 bg-red-600 text-white py-1 rounded-lg flex justify-center hover:bg-red-700"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;
