import { useState, useEffect } from "react";
import { ShieldCheck, ArrowRight, Users, FileText, Lock } from "lucide-react";

const Landing = ({ onGetStarted }) => {
  // 1. Uniquement tes vraies images ici (Fini les photos Unsplash bizarres !)
  const images = [
    "carte-du-madagascar-53943632.webp", // Ta carte avec la punaise
    "image2.jpg", // Remplace par tes propres captures d'écran de l'IHM
    "image3.jpg", // Remplace par une autre image à toi
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 2. Basculement rapide toutes les 2 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      {/* Navbar Institutionnelle */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#007A33]/10 rounded-xl">
            <ShieldCheck className="w-7 h-7 text-[#007A33]" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-slate-900">
              TOKANA<span className="text-[#FC3D21]">ID</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400 font-bold">
              Repoblikan'i Madagasikara
            </span>
          </div>
        </div>

        <button
          onClick={onGetStarted}
          className="px-6 py-2.5 bg-[#007A33] hover:bg-[#00642a] text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-98"
        >
          Connexion / Inscription
        </button>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-8 pt-12 pb-20 grid lg:grid-cols-12 gap-12 items-center">
        {/* Partie Gauche : Textes et Options d'accès */}
        <div className="lg:col-span-7 space-y-8">
          <p className="text-sm font-mono font-bold uppercase tracking-widest text-[#FC3D21]">
            — L’infrastructure de confiance au service des citoyens.
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            L'Identité Numérique de la République
          </h1>

          <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">
            Système national sécurisé pour la gestion de l'État Civil. Rapide,
            fiable et accessible. Sélectionnez un portail pour commencer vos
            démarches.
          </p>

          {/* Grille de boutons d'options */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
            <button
              onClick={onGetStarted}
              className="px-5 py-4 bg-[#007A33] hover:bg-[#00642a] text-white text-left font-bold text-sm rounded-xl transition shadow-md shadow-[#007A33]/10 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 shrink-0" />
                <span>Gestion Citoyenne</span>
              </div>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onGetStarted}
              className="px-5 py-4 bg-white hover:bg-slate-50 text-slate-700 text-left font-bold text-sm rounded-xl border-2 border-slate-200 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                <span>Archivage des Actes</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onGetStarted}
              className="px-5 py-4 bg-white hover:bg-slate-50 text-slate-700 text-left font-bold text-sm rounded-xl border-2 border-slate-200 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0" />
                <span>Sécurité Totale & Souveraine</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onGetStarted}
              className="px-5 py-4 bg-white hover:bg-slate-50 text-slate-700 text-left font-bold text-sm rounded-xl border-2 border-slate-200 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                <span>Accéder au Portail Public</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <p className="text-xs text-slate-500 pt-2">
            Besoin d'assistance avec vos identifiants ?{" "}
            <span className="text-[#FC3D21] font-bold cursor-pointer hover:underline">
              Contactez le guichet unique numérisé
            </span>
          </p>
        </div>

        {/* Partie Droite : Arc de cercle avec Carrousel propre */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[450px] aspect-[4/5] rounded-tl-[240px] rounded-bl-[240px] rounded-tr-3xl rounded-br-3xl overflow-hidden bg-slate-100 border-4 border-white shadow-2xl">
            {/* Voile dégradé subtil Madagascar */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#007A33]/10 via-transparent to-[#FC3D21]/5 z-10 pointer-events-none" />

            {/* Image animée */}
            <img
              src={images[currentImageIndex]}
              alt="Illustration TOKANA ID"
              className="w-full h-full object-cover relative z-0 transition-all duration-500 ease-in-out"
              key={currentImageIndex}
            />

            {/* Points indicateurs ajustés dynamiquement selon ton nombre d'images */}
            <div className="absolute bottom-4 right-6 z-20 flex gap-1.5 bg-black/20 backdrop-blur-xs px-2 py-1 rounded-full">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentImageIndex ? "bg-white w-3" : "bg-white/50"}`}
                />
              ))}
            </div>
          </div>

          {/* Badge de souveraineté nationale */}
          <div className="absolute bottom-6 left-0 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 z-20">
            <div className="w-2 h-10 bg-gradient-to-b from-[#FC3D21] to-[#007A33] rounded-full" />
            <div>
              <p className="text-xs font-black text-slate-900">
                Données protégées et souveraines
              </p>
              <p className="text-[11px] text-slate-500">
                Infrastructure nationale critique
              </p>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Landing;
