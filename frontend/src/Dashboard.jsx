import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, FileText, Settings, LogOut, Shield, MapPin, Briefcase, Calendar, ExternalLink,
  X, Printer, Download, Heart, Send, Clock, Check, Ban, Skull, Search, PlusCircle, MessageSquare
} from 'lucide-react';
import { getCitoyen, getActeNaissance, getActeMariage, getActeDeces, getProches, getListeActesDecesAccessibles, declarerMariage, declarerDeces, getPendingMarriageRequests, validerMariageConjoint } from './api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États actes
  const [selectedActe, setSelectedActe] = useState(null);
  const [selectedMariage, setSelectedMariage] = useState(null);
  const [selectedDeces, setSelectedDeces] = useState(null);
  const [selectedDecesCin, setSelectedDecesCin] = useState(null); // Nouveau état pour le CIN
  const [showModal, setShowModal] = useState(false);
  const [showMariageModal, setShowMariageModal] = useState(false);
  const [showDecesModal, setShowDecesModal] = useState(false);
  const [pendingMariage, setPendingMariage] = useState(null);

  // État décès / Mariage
  const [showSearchDecesModal, setShowSearchDecesModal] = useState(false);
  const [showDeclareDecesModal, setShowDeclareDecesModal] = useState(false);
  const [showDeclareForm, setShowDeclareForm] = useState(false);
  const [actesDecesDisponibles, setActesDecesDisponibles] = useState([]);
  const [proches, setProches] = useState([]);
  const [declarationData, setDeclarationData] = useState({
    numero_cin_conjoint: "",
    date_mariage: "",
    lieu_mariage: "",
    regime: "Communauté de biens réduite aux acquêts",
  });
  const [decesData, setDecesData] = useState({
    numero_cin: "",
    date_deces: "",
    lieu_deces: "",
    cause_deces: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchProfile(parsedUser.numero_cin);
      checkMarriage(parsedUser.numero_cin);
      checkPendingRequests(parsedUser.numero_cin);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchProfile = async (cin) => {
    try {
      const response = await getCitoyen(cin);
      setProfile(response.data);
    } catch (error) {
      console.error("Erreur profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkMarriage = async (cin) => {
    try {
      const response = await getActeMariage(cin);
      setSelectedMariage(response.data);
    } catch (error) {
      setSelectedMariage(null);
    }
  };

  const checkPendingRequests = async (cin) => {
    try {
      const response = await getPendingMarriageRequests(cin);
      if (response.data.length > 0) {
        setPendingMariage(response.data[0]);
      }
    } catch (error) {
      console.error("Erreur vérification demandes:", error);
    }
  };

  const handleDecision = async (action) => {
    try {
      await validerMariageConjoint(pendingMariage.id_acte, user.numero_cin, action);
      alert(`Demande ${action.toLowerCase()}ée.`);
      setPendingMariage(null);
      checkMarriage(user.numero_cin);
    } catch (error) {
      alert("Erreur.");
    }
  };

  const handleViewNaissance = async () => {
    try {
      const response = await getActeNaissance(user.numero_cin);
      setSelectedActe(response.data);
      setShowModal(true);
    } catch (error) {
      alert("Aucun acte de naissance trouvé.");
    }
  };

  const handleViewMariage = () => {
    if (selectedMariage) {
      if (selectedMariage.statut === "OFFICIEL") setShowMariageModal(true);
      else alert(`Demande en cours : ${selectedMariage.statut.replace(/_/g, " ")}`);
    } else {
      setShowDeclareForm(true);
    }
  };

  const handleViewDeces = async () => {
    try {
      const response = await getListeActesDecesAccessibles(user.numero_cin);
      setActesDecesDisponibles(response.data);
      const prochesResp = await getProches(user.numero_cin);
      setProches(prochesResp.data);
      setShowSearchDecesModal(true);
    } catch (error) {
      alert("Erreur lors de la récupération.");
    }
  };

  const viewDeces = async (cin) => {
    try {
      const response = await getActeDeces(cin, user.numero_cin);
      setSelectedDeces(response.data);
      setSelectedDecesCin(cin); // Stockage du CIN
      setShowSearchDecesModal(false);
      setShowDecesModal(true);
    } catch (error) {
      alert("Accès non autorisé.");
    }
  };

  const startDeclarationDeces = (proche) => {
    setDecesData({...decesData, numero_cin: proche.numero_cin});
    setShowSearchDecesModal(false);
    setShowDeclareDecesModal(true);
  };

  const handleSubmitDeclarationDeces = async (e) => {
    e.preventDefault();
    try {
      await declarerDeces(decesData, user.numero_cin);
      alert("Déclaration de décès soumise.");
      setShowDeclareDecesModal(false);
      setDecesData({ numero_cin: '', date_deces: '', lieu_deces: '', cause_deces: '' });
    } catch (error) {
      alert("Erreur: " + (error.response?.data?.detail || "Impossible d'envoyer la demande"));
    }
  };

  const handleSubmitDeclaration = async (e) => {
    e.preventDefault();
    try {
      await declarerMariage({
        ...declarationData,
        numero_cin_demandeur: user.numero_cin,
      });
      alert("Déclaration envoyée.");
      setShowDeclareForm(false);
      checkMarriage(user.numero_cin);
    } catch (error) {
      alert("Erreur: " + (error.response?.data?.detail || "Impossible d'envoyer la demande"));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vert"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-8">
          <div className="text-2xl font-black text-vert tracking-tighter">TOKANA-ID</div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
            <button onClick={() => navigate("/dashboard")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-vert/10 text-vert"><User size={18} /> Mon Profil</button>
            <button onClick={() => navigate("/forum")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50"><MessageSquare size={18} /> Forum</button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rouge hover:bg-red-50 transition"><LogOut size={18} /> Déconnexion</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12"><h1 className="text-3xl font-black text-gray-900">Manao ahoana, {profile?.prenom || user?.username} !</h1></header>
          
          <section className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mb-12">
              <h3 className="text-lg font-bold mb-6">Informations Personnelles</h3>
              {profile && (
                <div className="grid grid-cols-2 gap-8">
                  <div><p className="text-xs text-gray-400">Nom</p><p className="font-bold">{profile.nom} {profile.prenom}</p></div>
                  <div><p className="text-xs text-gray-400">CIN</p><p className="font-bold">{profile.numero_cin}</p></div>
                  <div><p className="text-xs text-gray-400">Profession</p><p className="font-bold">{profile.profession || 'Non renseigné'}</p></div>
                  <div><p className="text-xs text-gray-400">Domicile</p><p className="font-bold">{profile.domicile || 'Non renseigné'}</p></div>
                  <div><p className="text-xs text-gray-400">Statut Matrimonial</p><p className="font-bold">{selectedMariage && selectedMariage.statut === "OFFICIEL" ? "Marié(e)" : "Célibataire"}</p></div>
                </div>
              )}
          </section>

          <section>
            <h3 className="text-xl font-bold mb-6">Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={handleViewNaissance} className="flex flex-col items-center gap-4 p-6 bg-white border border-gray-100 rounded-[1.5rem] hover:shadow-lg transition text-center group">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white"><FileText size={24} /></div>
                <h4 className="font-bold">Naissance</h4>
              </button>
              <button onClick={handleViewMariage} className="flex flex-col items-center gap-4 p-6 bg-white border border-gray-100 rounded-[1.5rem] hover:shadow-lg transition text-center group">
                <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-white"><Heart size={24} /></div>
                <h4 className="font-bold">Mariage</h4>
              </button>
              <button onClick={handleViewDeces} className="flex flex-col items-center gap-4 p-6 bg-white border border-gray-100 rounded-[1.5rem] hover:shadow-lg transition text-center group">
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center text-white"><Skull size={24} /></div>
                <h4 className="font-bold">Décès</h4>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Modal Sélection Décès */}
      {showSearchDecesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
             <div className="bg-gray-800 p-8 text-white"><h3 className="text-xl font-black">Actes de Décès</h3></div>
             <div className="p-4 space-y-2">
                <h4 className="px-4 text-xs font-black text-gray-400 uppercase">Actes Officiels</h4>
                {actesDecesDisponibles.map(acte => (
                  <button key={acte.id} onClick={() => viewDeces(acte.numero_cin)} className="w-full p-4 flex justify-between bg-gray-50 rounded-xl hover:bg-gray-100">
                    <span>{acte.nom} {acte.prenom}</span><ExternalLink size={16} />
                  </button>
                ))}
                <h4 className="px-4 mt-6 text-xs font-black text-gray-400 uppercase">Déclarer un décès</h4>
                {proches.map(p => (
                  <button key={p.numero_cin} onClick={() => startDeclarationDeces(p)} className="w-full p-4 flex justify-between items-center bg-pink-50 rounded-xl hover:bg-pink-100 text-pink-700">
                    <div>
                        <p className="font-bold">{p.nom} {p.prenom}</p>
                        <p className="text-[10px] uppercase font-black opacity-75">{p.type_lien}</p>
                    </div>
                    <PlusCircle size={16} />
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Modal Décès (Premium) */}
      {showDecesModal && selectedDeces && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 tracking-tight uppercase">Acte de Décès N°{selectedDeces.numero_acte}</h3>
              <div className="flex gap-2">
                <a 
                  href={`http://localhost:8000/api/actes/deces/${selectedDecesCin}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-900 text-white rounded-xl hover:bg-black transition"
                >
                  <Download size={20} />
                </a>
                <button onClick={() => setShowDecesModal(false)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-rouge transition"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-[#FCFCFA]">
              <div className="relative text-center space-y-6">
                <img src="/Seal_of_Madagascar.svg.png" className="w-24 h-24 mx-auto" alt="Sceau" />
                <div className="border-y border-dashed border-gray-200 py-8 space-y-4 text-left">
                  <p className="font-bold text-center">Déclaration de décès de {selectedDeces.nom} {selectedDeces.prenom}.</p>
                  <div className="grid grid-cols-2 gap-8">
                    <div><label className="text-[10px] font-black text-gray-400 uppercase">Date du décès</label><p className="text-lg font-black">{selectedDeces.date_deces}</p></div>
                    <div><label className="text-[10px] font-black text-gray-400 uppercase">Lieu du décès</label><p className="text-lg font-black">{selectedDeces.lieu_deces}</p></div>
                  </div>
                </div>
                <div className="bg-white/50 p-4 rounded-2xl border border-gray-100 text-left">
                    <h4 className="text-xs font-black text-vert uppercase">Cause du décès</h4>
                    <p className="text-sm font-bold">{selectedDeces.cause_deces || 'Non renseignée'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Naissance (Premium) */}
      {showModal && selectedActe && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 tracking-tight uppercase">Acte de Naissance N°{selectedActe.numero_acte}</h3>
              <div className="flex gap-2">
                <a 
                  href={`http://localhost:8000/api/actes/naissance/${user?.numero_cin}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-900 text-white rounded-xl hover:bg-black transition"
                >
                  <Download size={20} />
                </a>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-rouge transition"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-[#FCFCFA]">
              <div className="text-center space-y-6">
                <div className="border-y border-dashed border-gray-200 py-8 space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-8">
                    <div><label className="text-[10px] font-black text-gray-400 uppercase">Nom & Prénoms</label><p className="text-xl font-black">{selectedActe.nom} {selectedActe.prenom}</p></div>
                    <div><label className="text-[10px] font-black text-gray-400 uppercase">Sexe</label><p className="text-xl font-black">{selectedActe.sexe}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div><label className="text-[10px] font-black text-gray-400 uppercase">Date Naissance</label><p className="font-bold">{selectedActe.date_naissance} à {selectedActe.heure_naissance || '08:00'}</p></div>
                    <div><label className="text-[10px] font-black text-gray-400 uppercase">Lieu</label><p className="font-bold">{selectedActe.lieu_naissance}</p></div>
                  </div>
                </div>
                <div className="space-y-4 text-left">
                  <div className="bg-white/50 p-4 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-black text-vert uppercase">Filiation Paternelle</h4>
                    <p className="text-sm font-bold">{selectedActe.pere ? `${selectedActe.pere.nom} ${selectedActe.pere.prenom} - ${selectedActe.pere.profession || 'N/A'}, ${selectedActe.pere.domicile || 'N/A'}` : "Non renseigné"}</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-black text-vert uppercase">Filiation Maternelle</h4>
                    <p className="text-sm font-bold">{selectedActe.mere ? `${selectedActe.mere.nom} ${selectedActe.mere.prenom} - ${selectedActe.mere.profession || 'N/A'}, ${selectedActe.mere.domicile || 'N/A'}` : "Non renseignée"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Déclaration Mariage */}
      {showDeclareForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8">
            <h3 className="text-2xl font-black mb-6">Déclarer une Union</h3>
            <form onSubmit={handleSubmitDeclaration} className="space-y-4">
              <input
                className="w-full px-5 py-4 bg-gray-50 rounded-2xl"
                placeholder="CIN Conjoint"
                value={declarationData.numero_cin_conjoint}
                onChange={(e) =>
                  setDeclarationData({
                    ...declarationData,
                    numero_cin_conjoint: e.target.value,
                  })
                }
                required
              />
              <input
                className="w-full px-5 py-4 bg-gray-50 rounded-2xl"
                type="date"
                value={declarationData.date_mariage}
                onChange={(e) =>
                  setDeclarationData({
                    ...declarationData,
                    date_mariage: e.target.value,
                  })
                }
                required
              />
              <button
                type="submit"
                className="w-full py-4 bg-pink-600 text-white font-bold rounded-2xl hover:bg-pink-700 transition"
              >
                Envoyer la demande
              </button>
              <button
                type="button"
                onClick={() => setShowDeclareForm(false)}
                className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition"
              >
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Affichage Mariage (Premium) */}
      {showMariageModal && selectedMariage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 tracking-tight uppercase">Acte de Mariage N°{selectedMariage.numero_acte}</h3>
              <div className="flex gap-2">
                <a 
                  href={`http://localhost:8000/api/actes/mariage/${user?.numero_cin}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-900 text-white rounded-xl hover:bg-black transition"
                >
                  <Download size={20} />
                </a>
                <button onClick={() => setShowMariageModal(false)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-rouge transition"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-[#FCFCFA]">
              <div className="relative text-center space-y-6">
                <img src="/Seal_of_Madagascar.svg.png" className="w-24 h-24 mx-auto" alt="Sceau" />
                <div className="border-y border-dashed border-gray-200 py-8 space-y-4 text-left">
                  <p className="font-bold text-center">Mariage célébré le {selectedMariage.date_mariage} à {selectedMariage.lieu_mariage}.</p>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase">Époux</label>
                        <p className="text-lg font-black">{selectedMariage.epoux.nom} {selectedMariage.epoux.prenom}</p>
                        <p className="text-sm">CIN: {selectedMariage.epoux.numero_cin}</p>
                        <p className="text-sm">Profession: {selectedMariage.epoux.profession || 'N/A'}</p>
                        <p className="text-sm">Domicile: {selectedMariage.epoux.domicile || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase">Épouse</label>
                        <p className="text-lg font-black">{selectedMariage.epouse.nom} {selectedMariage.epouse.prenom}</p>
                        <p className="text-sm">CIN: {selectedMariage.epouse.numero_cin}</p>
                        <p className="text-sm">Profession: {selectedMariage.epouse.profession || 'N/A'}</p>
                        <p className="text-sm">Domicile: {selectedMariage.epouse.domicile || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-left">
                  <div className="bg-white/50 p-4 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-black text-vert uppercase">Parents de l'Époux</h4>
                    <p className="text-sm font-bold">Père: {selectedMariage.epoux_parents.pere ? `${selectedMariage.epoux_parents.pere.nom} ${selectedMariage.epoux_parents.pere.prenom}` : "Non renseigné"}</p>
                    <p className="text-sm font-bold">Mère: {selectedMariage.epoux_parents.mere ? `${selectedMariage.epoux_parents.mere.nom} ${selectedMariage.epoux_parents.mere.prenom}` : "Non renseignée"}</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-black text-vert uppercase">Parents de l'Épouse</h4>
                    <p className="text-sm font-bold">Père: {selectedMariage.epouse_parents.pere ? `${selectedMariage.epouse_parents.pere.nom} ${selectedMariage.epouse_parents.pere.prenom}` : "Non renseigné"}</p>
                    <p className="text-sm font-bold">Mère: {selectedMariage.epouse_parents.mere ? `${selectedMariage.epouse_parents.mere.nom} ${selectedMariage.epouse_parents.mere.prenom}` : "Non renseignée"}</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-black text-vert uppercase">Régime Matrimonial</h4>
                    <p className="text-sm font-bold">{selectedMariage.regime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Demande Mariage Reçue */}
      {pendingMariage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-lg text-center">
            <h3 className="font-black text-xl mb-4">Nouvelle demande de mariage</h3>
            <p className="text-gray-600 mb-6">
              {pendingMariage.nom_demandeur} {pendingMariage.prenom_demandeur} vous a envoyé une demande de mariage.
            </p>
            <div className="flex gap-4">
              <button onClick={() => handleDecision("REFUSER")} className="flex-1 p-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition">Refuser</button>
              <button onClick={() => handleDecision("ACCEPTER")} className="flex-1 p-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition">Accepter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
