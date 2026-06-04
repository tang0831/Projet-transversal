import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Map, 
  Users, 
  Database, 
  ArrowRight, 
  Activity, 
  Globe 
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center py-6 px-12 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src="/Seal_of_Madagascar.svg.png" alt="Logo" className="w-10 h-10" />
          <div className="text-2xl font-black text-rouge tracking-tighter">TOKANA-ID</div>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-vert">Fonctionnalités</a>
          <button 
            className="px-5 py-2.5 bg-vert text-white text-sm font-bold rounded-full hover:bg-green-800 transition"
            onClick={() => navigate('/login')}
          >
            Se connecter
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-5xl mx-auto text-center py-24 px-6">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          L'identité numérique <br />
          <span className="text-vert">au cœur de Madagascar.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Centralisez, sécurisez et modernisez l'état civil. Une plateforme souveraine pour une identité infalsifiable de la naissance au décès.
        </p>
        <button 
          className="px-8 py-4 bg-rouge text-white font-bold rounded-full hover:bg-red-700 transition flex items-center gap-2 mx-auto"
          onClick={() => navigate('/login')}
        >
          Accéder à la plateforme <ArrowRight size={20} />
        </button>
      </header>

      {/* Stats Bar */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto flex justify-between px-12">
          {[
            { value: "23", label: "Régions couvertes" },
            { value: "M+", label: "Identités sécurisées" },
            { value: "100%", label: "Fiabilité" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-black text-vert">{stat.value}</div>
              <div className="text-sm text-gray-500 font-semibold uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-6xl mx-auto py-24 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: ShieldCheck, title: "Sécurité Absolue", desc: "Hachage robuste et logs immuables pour chaque opération." },
          { icon: Database, title: "Base SQL Centrale", desc: "Données structurées pour une performance optimale (O(log n))." },
          { icon: Globe, title: "Mode Hors-ligne", desc: "Continuité de service garantie dans les zones isolées." },
          { icon: Users, title: "Gestion de Parenté", desc: "Structure Union-Find pour la cohérence généalogique." },
          { icon: Map, title: "Recherche Rapide", desc: "Algorithme Boyer-Moore pour des recherches instantanées." },
          { icon: Activity, title: "Auto-complétion", desc: "Trie numérique pour une saisie rapide sans erreur." }
        ].map((feat, i) => (
          <div key={i} className="p-8 border border-gray-100 rounded-3xl hover:shadow-xl transition">
            <div className="bg-gray-50 w-14 h-14 rounded-2xl flex items-center justify-center text-vert mb-6">
              <feat.icon size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
            <p className="text-gray-500 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
