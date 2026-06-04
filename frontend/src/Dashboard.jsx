import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, FileText, Settings, LogOut, Shield, MapPin, Briefcase, Calendar, ExternalLink,
  X, Printer, Download, Heart, Send, Clock, Check, Ban, Skull, Search, PlusCircle
} from 'lucide-react';
import { getCitoyen, getActeNaissance, getActeMariage, getActeDeces, getProches, getListeActesDecesAccessibles, declarerMariage, getPendingMarriageRequests, validerMariageConjoint } from './api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États actes
  const [selectedActe, setSelectedActe] = useState(null);
  const [selectedMariage, setSelectedMariage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showMariageModal, setShowMariageModal] = useState(false);
  const [pendingMariage, setPendingMariage] = useState(null);

  // État décès / Mariage
  const [showSearchDecesModal, setShowSearchDecesModal] = useState(false);
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
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-8">
          <div className="text-2xl font-black text-vert tracking-tighter">
            TOKANA-ID
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-vert/10 text-vert"
          >
            <User size={18} /> Mon Profil
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rouge hover:bg-red-50 transition"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-3xl font-black text-gray-900">
              Manao ahoana, {profile?.prenom || user?.username} !
            </h1>
          </header>

          <section className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mb-12">
            <h3 className="text-lg font-bold mb-6">
              Informations Personnelles
            </h3>
            {profile && (
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs text-gray-400">Nom</p>
                  <p className="font-bold">
                    {profile.nom} {profile.prenom}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">CIN</p>
                  <p className="font-bold">{profile.numero_cin}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Profession</p>
                  <p className="font-bold">
                    {profile.profession || "Non renseigné"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Domicile</p>
                  <p className="font-bold">
                    {profile.domicile || "Non renseigné"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Statut Matrimonial</p>
                  <p className="font-bold">
                    {selectedMariage && selectedMariage.statut === "OFFICIEL" ? "Marié(e)" : "Célibataire"}
                  </p>
                </div>
              </div>
            )}
          </section>

          <section>
            <h3 className="text-xl font-bold mb-6">Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleViewNaissance}
                className="flex flex-col items-center gap-4 p-6 bg-white border border-gray-100 rounded-[1.5rem] hover:shadow-lg transition text-center group"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white">
                  <FileText size={24} />
                </div>
                <h4 className="font-bold">Naissance</h4>
              </button>
              <button
                onClick={handleViewMariage}
                className="flex flex-col items-center gap-4 p-6 bg-white border border-gray-100 rounded-[1.5rem] hover:shadow-lg transition text-center group"
              >
                <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-white">
                  <Heart size={24} />
                </div>
                <h4 className="font-bold">Mariage</h4>
              </button>
              <button
                onClick={handleViewDeces}
                className="flex flex-col items-center gap-4 p-6 bg-white border border-gray-100 rounded-[1.5rem] hover:shadow-lg transition text-center group"
              >
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center text-white">
                  <Skull size={24} />
                </div>
                <h4 className="font-bold">Décès</h4>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Modal Naissance */}
      {showModal && selectedActe && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 tracking-tight uppercase">
                Acte de Naissance N°{selectedActe.numero_acte}
              </h3>
              <div className="flex gap-2">
                <a
                  href={`http://localhost:8000/api/actes/naissance/${user?.numero_cin}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-vert text-white rounded-xl hover:bg-green-700 transition"
                >
                  <Download size={20} />
                </a>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-rouge transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-[#FCFCFA]">
              <div className="text-center space-y-6">
                <div className="border-y border-dashed border-gray-200 py-8 space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase">
                        Nom & Prénoms
                      </label>
                      <p className="text-xl font-black">
                        {selectedActe.nom} {selectedActe.prenom}
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase">
                        Sexe
                      </label>
                      <p className="text-xl font-black">{selectedActe.sexe}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase">
                        Date Naissance
                      </label>
                      <p className="font-bold">
                        {selectedActe.date_naissance} à{" "}
                        {selectedActe.heure_naissance || "08:00"}
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase">
                        Lieu
                      </label>
                      <p className="font-bold">{selectedActe.lieu_naissance}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Mariage */}
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
                  className="p-2 bg-vert text-white rounded-xl hover:bg-green-700 transition"
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
                  <p className="font-bold">Mariage célébré le {selectedMariage.date_mariage} à {selectedMariage.lieu_mariage}.</p>
                  <div className="grid grid-cols-2 gap-8">
                    <div><label className="text-[10px] font-black text-gray-400 uppercase">Époux</label><p className="text-lg font-black">{selectedMariage.epoux.nom} {selectedMariage.epoux.prenom}</p></div>
                    <div><label className="text-[10px] font-black text-gray-400 uppercase">Épouse</label><p className="text-lg font-black">{selectedMariage.epouse.nom} {selectedMariage.epouse.prenom}</p></div>
                  </div>
                </div>
                <div className="space-y-4 text-left">
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
    </div>
  );
}
