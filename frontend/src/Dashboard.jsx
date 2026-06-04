import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, FileText, Settings, LogOut, Shield, MapPin, Briefcase, Calendar, ExternalLink,
  X, Printer, Download, Heart, Send, Clock, Check, Ban, Skull, Search, PlusCircle, MessageSquare, QrCode
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { getCitoyen, getActeNaissance, getActeMariage, getActeDeces, getProches, getListeActesDecesAccessibles, declarerMariage, declarerDeces, getPendingMarriageRequests, validerMariageConjoint } from './api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedActe, setSelectedActe] = useState(null);
  const [selectedMariage, setSelectedMariage] = useState(null);
  const [selectedDeces, setSelectedDeces] = useState(null);
  const [selectedDecesCin, setSelectedDecesCin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showMariageModal, setShowMariageModal] = useState(false);
  const [showDecesModal, setShowDecesModal] = useState(false);
  const [pendingMariage, setPendingMariage] = useState(null);

  const [showSearchDecesModal, setShowSearchDecesModal] = useState(false);
  const [showDeclareDecesModal, setShowDeclareDecesModal] = useState(false);
  const [showDeclareForm, setShowDeclareForm] = useState(false);
  const [actesDecesDisponibles, setActesDecesDisponibles] = useState([]);
  const [proches, setProches] = useState([]);
  const [declarationData, setDeclarationData] = useState({ numero_cin_conjoint: "", date_mariage: "", lieu_mariage: "", regime: "Communauté de biens réduite aux acquêts" });
  const [decesData, setDecesData] = useState({ numero_cin: "", date_deces: "", lieu_deces: "", cause_deces: "" });

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
    } catch (error) { console.error("Erreur profil:", error); } 
    finally { setLoading(false); }
  };

  const checkMarriage = async (cin) => {
    try {
      const response = await getActeMariage(cin);
      setSelectedMariage(response.data);
    } catch (error) { setSelectedMariage(null); }
  };

  const checkPendingRequests = async (cin) => {
    try {
      const response = await getPendingMarriageRequests(cin);
      if (response.data.length > 0) setPendingMariage(response.data[0]);
    } catch (error) { console.error("Erreur vérification demandes:", error); }
  };

  const handleDecision = async (action) => {
    try {
      await validerMariageConjoint(pendingMariage.id_acte, user.numero_cin, action);
      alert(`Demande ${action.toLowerCase()}ée.`);
      setPendingMariage(null);
      checkMarriage(user.numero_cin);
    } catch (error) { alert("Erreur."); }
  };

  const handleViewNaissance = async () => {
    try {
      const response = await getActeNaissance(user.numero_cin);
      setSelectedActe(response.data);
      setShowModal(true);
    } catch (error) { alert("Aucun acte de naissance trouvé."); }
  };

  const handleViewMariage = () => {
    if (selectedMariage) {
      if (selectedMariage.statut === "OFFICIEL") setShowMariageModal(true);
      else alert(`Demande en cours : ${selectedMariage.statut.replace(/_/g, " ")}`);
    } else setShowDeclareForm(true);
  };

  const handleViewDeces = async () => {
    try {
      const response = await getListeActesDecesAccessibles(user.numero_cin);
      setActesDecesDisponibles(response.data);
      const prochesResp = await getProches(user.numero_cin);
      setProches(prochesResp.data);
      setShowSearchDecesModal(true);
    } catch (error) { alert("Erreur lors de la récupération."); }
  };

  const viewDeces = async (cin) => {
    try {
      const response = await getActeDeces(cin, user.numero_cin);
      setSelectedDeces(response.data);
      setSelectedDecesCin(cin);
      setShowSearchDecesModal(false);
      setShowDecesModal(true);
    } catch (error) { alert("Accès non autorisé."); }
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
    } catch (error) { alert("Erreur: " + (error.response?.data?.detail || "Impossible d'envoyer la demande")); }
  };

  const handleSubmitDeclaration = async (e) => {
    e.preventDefault();
    try {
      await declarerMariage({...declarationData, numero_cin_demandeur: user.numero_cin});
      alert("Déclaration envoyée.");
      setShowDeclareForm(false);
      checkMarriage(user.numero_cin);
    } catch (error) { alert("Erreur: " + (error.response?.data?.detail || "Impossible d'envoyer la demande")); }
  };

  const handleLogout = () => { localStorage.removeItem("user"); navigate("/login"); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vert"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-8"><div className="text-2xl font-black text-vert tracking-tighter">TOKANA-ID</div></div>
        <nav className="flex-1 px-4 space-y-2">
            <button onClick={() => navigate("/dashboard")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-vert/10 text-vert"><User size={18} /> Mon Profil</button>
            <button onClick={() => navigate("/forum")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50"><MessageSquare size={18} /> Forum</button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rouge hover:bg-red-50 transition"><LogOut size={18} /> Déconnexion</button>
        </div>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12 flex justify-between items-center">
            <h1 className="text-3xl font-black text-gray-900">Manao ahoana, {profile?.prenom || user?.username} !</h1>
            <div className="flex gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-black text-gray-600 uppercase">Identité Vérifiée</span>
              </div>
            </div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <section className="col-span-2 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><User size={20} className="text-vert"/> Informations Personnelles</h3>
              {profile && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Nom complet</p><p className="font-black text-gray-900 text-lg">{profile.nom} {profile.prenom}</p></div>
                  <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Numéro CIN</p><p className="font-black text-gray-900 text-lg">{profile.numero_cin}</p></div>
                  <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Date Naissance</p><p className="font-bold text-gray-700">{profile.date_naissance}</p></div>
                  <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Lieu</p><p className="font-bold text-gray-700">{profile.lieu_naissance}</p></div>
                  <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Profession</p><p className="font-bold text-gray-700">{profile.profession || 'Non renseigné'}</p></div>
                  <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Statut Matrimonial</p><p className="font-bold text-gray-700">{selectedMariage && selectedMariage.statut === "OFFICIEL" ? "Marié(e)" : "Célibataire"}</p></div>
                </div>
              )}
            </section>
            
            <section className="bg-gray-900 rounded-[2rem] p-8 text-white flex flex-col justify-between shadow-xl">
// ...
              <h3 className="font-bold flex items-center gap-2"><QrCode size={20} className="text-vert"/> QR Code ID</h3>
              <p className="text-xs text-gray-400 mt-2">Présentez ce code pour justifier de votre identité sans document physique.</p>
              <div className="bg-white p-2 rounded-xl w-fit mx-auto my-4">
                <QRCodeCanvas value={user?.numero_cin || ""} size={96} />
              </div>
              <button className="w-full bg-white/10 p-3 rounded-xl text-xs font-bold hover:bg-white/20 transition">Partager mon ID</button>
            </section>
          </div>

          <section>
            <h3 className="text-xl font-black mb-6">Services Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={handleViewNaissance} className="flex flex-col items-center gap-4 p-8 bg-white border border-gray-100 rounded-[2rem] hover:shadow-xl transition group">
                <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20"><FileText size={32} /></div>
                <h4 className="font-black text-lg">Naissance</h4>
              </button>
              <button onClick={handleViewMariage} className="flex flex-col items-center gap-4 p-8 bg-white border border-gray-100 rounded-[2rem] hover:shadow-xl transition group">
                <div className="w-16 h-16 bg-pink-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-pink-500/20"><Heart size={32} /></div>
                <h4 className="font-black text-lg">Mariage</h4>
              </button>
              <button onClick={handleViewDeces} className="flex flex-col items-center gap-4 p-8 bg-white border border-gray-100 rounded-[2rem] hover:shadow-xl transition group">
                <div className="w-16 h-16 bg-gray-800 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-gray-800/20"><Skull size={32} /></div>
                <h4 className="font-black text-lg">Décès</h4>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Modals... (Garder les modales existantes) */}
    </div>
  );
}
