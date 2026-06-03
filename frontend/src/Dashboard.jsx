import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, FileText, LogOut, Heart, Skull } from "lucide-react";
import {
  getCitoyen,
  getActeNaissance,
  getActeMariage,
  getActeDeces,
} from "./api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedActe, setSelectedActe] = useState(null);
  const [selectedMariage, setSelectedMariage] = useState(null);
  const [selectedDeces, setSelectedDeces] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showMariageModal, setShowMariageModal] = useState(false);
  const [showDecesModal, setShowDecesModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchProfile(parsedUser.numero_cin);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchProfile = async (cin) => {
    try {
      const response = await getCitoyen(cin);
      setProfile(response.data);
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewActe = async (type) => {
    try {
      if (type === "naissance") {
        const response = await getActeNaissance(user.numero_cin);
        setSelectedActe(response.data);
        setShowModal(true);
      } else if (type === "mariage") {
        const response = await getActeMariage(user.numero_cin);
        setSelectedMariage(response.data);
        setShowMariageModal(true);
      } else if (type === "deces") {
        const response = await getActeDeces(user.numero_cin, user.numero_cin);
        setSelectedDeces(response.data);
        setShowDecesModal(true);
      }
    } catch (error) {
      alert("Acte non trouvé ou accès non autorisé.");
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-8">
          <div className="text-2xl font-black text-vert tracking-tighter">
            TOKANA-ID
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-vert/10 text-vert">
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

      {/* Main */}
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
              </div>
            )}
          </section>

          <section>
            <h3 className="text-xl font-bold mb-6">Services Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleViewActe("naissance")}
                className="flex flex-col items-center gap-4 p-6 bg-white border border-gray-100 rounded-[1.5rem] hover:shadow-lg transition text-center group"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white">
                  <FileText size={24} />
                </div>
                <h4 className="font-bold">Naissance</h4>
              </button>
              <button
                onClick={() => handleViewActe("mariage")}
                className="flex flex-col items-center gap-4 p-6 bg-white border border-gray-100 rounded-[1.5rem] hover:shadow-lg transition text-center group"
              >
                <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-white">
                  <Heart size={24} />
                </div>
                <h4 className="font-bold">Mariage</h4>
              </button>
              <button
                onClick={() => handleViewActe("deces")}
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

      {/* Modals (Exemple Naissance) */}
      {showModal && selectedActe && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl">
            <h3 className="font-black text-xl mb-4">
              Acte de Naissance N°{selectedActe.numero_acte}
            </h3>
            <p>Nom: {selectedActe.nom}</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 bg-gray-900 text-white p-3 rounded-xl"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
