import { useState, useEffect } from "react";
import {
  User,
  FileText,
  QrCode,
  Download,
  ShieldCheck,
  Wifi,
  WifiOff,
  LayoutDashboard,
  FileClock,
} from "lucide-react";
import api from "../api";

const Home = ({ user, setActiveTab }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [myActes, setMyActes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Détection du rôle de l'utilisateur basé sur ton API
  const isAgent =
    user?.role?.toUpperCase() === "AGENT" ||
    user?.role?.toUpperCase() === "ADMIN" ||
    user?.role?.toUpperCase() === "ADMINISTRATEUR";

  // Écouteur pour le statut de la connexion internet
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Récupération dynamique des actes du citoyen connecté
  useEffect(() => {
    const fetchUserActes = async () => {
      if (isAgent || !user?.id_utilisateur) {
        setLoading(false);
        return;
      }
      try {
        // Note: On utilise ici l'id_utilisateur comme identifiant citoyen pivot
        const response = await api.get(`/my-actes/${user.id_utilisateur}`);
        setMyActes(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des actes :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserActes();
  }, [user, isAgent]);

  // Déclenchement du téléchargement du PDF généré par ton API FastAPI
  const handleDownloadPDF = async (idActe, typeActe) => {
    try {
      const response = await api.get(`/actes/${idActe}/pdf`, {
        responseType: "blob", // Indispensable pour la réception d'un flux binaire PDF
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `acte_${typeActe.toLowerCase()}_${idActe}.pdf`;
      link.click();
    } catch (error) {
      console.error("Erreur lors du téléchargement du PDF :", error);
      alert("Impossible de générer le PDF de cet acte pour le moment.");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour et bonne matinée";
    if (hour < 18) return "Ravi de vous revoir en cette après-midi";
    return "Bonsoir, nous sommes ravis de votre visite";
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto text-slate-800">
      {/* 1. Header & Status */}
      <div className="flex justify-between items-center px-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, {user?.username?.split(" ")[0]} !
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isAgent
              ? "Espace de gestion de la souveraineté nationale."
              : "Prêt à gérer vos démarches avec Tokana ID ?"}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${isOnline ? "bg-green-50 text-[#007A33] border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}
        >
          {isOnline ? (
            <Wifi size={12} className="animate-pulse" />
          ) : (
            <WifiOff size={12} />
          )}
          {isOnline ? "EN LIGNE" : "HORS LIGNE"}
        </div>
      </div>

      {/* 2. Carte d'Identité Numérique Nationale */}
      <div className="bg-gradient-to-br from-[#007A33] to-green-900 rounded-3xl p-6 text-white shadow-xl mx-4 border border-white/10 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 overflow-hidden shadow-inner">
            {user?.photo ? (
              <img
                src={user.photo}
                alt="Profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={28} className="text-white/90" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {user?.username}
            </h2>
            <p className="text-green-200 text-[10px] font-black uppercase tracking-widest mt-0.5">
              {isAgent
                ? `Personnel d'État Civil • ${user?.role}`
                : "Citoyen Malagasy"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs bg-black/15 p-4 rounded-2xl backdrop-blur-md border border-white/5 font-medium">
          <div>
            <p className="text-green-300 text-[9px] font-bold uppercase tracking-wider mb-0.5">
              Identifiant unique
            </p>
            <p className="font-mono text-sm font-bold">
              {user?.id_utilisateur || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-green-300 text-[9px] font-bold uppercase tracking-wider mb-0.5">
              Juridiction / Région
            </p>
            <p className="text-sm font-bold truncate capitalize">
              {user?.region || "Nationale"}
            </p>
          </div>
        </div>

        {!isAgent && (
          <div className="mt-5 flex justify-center bg-white p-2.5 rounded-2xl shadow-inner max-w-[120px] mx-auto transition-transform hover:scale-105 duration-200">
            <QrCode className="text-slate-900" size={80} />
          </div>
        )}
      </div>

      {/* 3. Section des Actes Enregistrés (Dynamique) */}
      {!isAgent && (
        <div className="px-4">
          <h3 className="text-xs font-black uppercase text-slate-400 mb-3 tracking-widest">
            Vos Actes Numériques Récents
          </h3>

          {loading ? (
            <div className="text-center py-6 text-xs text-slate-400 font-medium animate-pulse">
              Synchronisation sécurisée avec le registre d'État Civil...
            </div>
          ) : myActes.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 italic">
              Aucun acte rattaché directement à cet identifiant pour le moment.
              Rapprochez-vous de votre commune.
            </div>
          ) : (
            <div className="space-y-3">
              {myActes.map((acte) => (
                <div
                  key={acte.id_acte}
                  className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-green-50 text-[#007A33] rounded-xl">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 capitalize">
                        Acte de {acte.type_acte.toLowerCase()}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-[#007A33] font-bold uppercase flex items-center gap-1 bg-green-50/50 px-1.5 py-0.5 rounded-md">
                          <ShieldCheck size={11} /> Certifié local
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Reg: #{acte.numero_registre}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleDownloadPDF(acte.id_acte, acte.type_acte)
                    }
                    className="bg-slate-50 text-slate-700 p-2.5 rounded-xl border border-slate-100 hover:bg-[#007A33]/10 hover:text-[#007A33] hover:border-[#007A33]/20 transition-all active:scale-95"
                    title="Télécharger l'extrait officiel"
                  >
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Raccourcis d'Actions Contextuels */}
      <div className="px-4 grid grid-cols-2 gap-4">
        {isAgent ? (
          <>
            <button
              onClick={() => setActiveTab("forum")} // Redirige vers la liste globale des dossiers
              className="bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={16} /> Traiter Demandes
            </button>
            <button
              onClick={() => setActiveTab("forum")} // Redirige vers le fil de discussion local
              className="bg-[#007A33] text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#00642a] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <FileClock size={16} /> Forum Commune
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab("forum")}
              className="bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-slate-800 transition-all active:scale-95"
            >
              Demander Extrait
            </button>
            <button
              onClick={() => setActiveTab("forum")}
              className="bg-[#007A33] text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#00642a] transition-all active:scale-95"
            >
              Déclarer Événement
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
