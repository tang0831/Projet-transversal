import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-vert rounded-lg flex items-center justify-center text-white font-black text-lg">T</div>
              <span className="text-xl font-black text-gray-900 tracking-tighter">TOKANA-ID</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Plateforme nationale souveraine pour l'identité civile numérique à Madagascar. 
              Moderniser l'état civil pour une administration plus proche de ses citoyens.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Plateforme</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li><a href="#" className="hover:text-vert transition">Comment ça marche ?</a></li>
              <li><a href="#" className="hover:text-vert transition">Sécurité des données</a></li>
              <li><a href="#" className="hover:text-vert transition">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">Légal</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li><a href="#" className="hover:text-vert transition">Mentions légales</a></li>
              <li><a href="#" className="hover:text-vert transition">Confidentialité</a></li>
              <li><a href="#" className="hover:text-vert transition">Conditions d'utilisation</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 font-medium">
            © 2026 TOKANA-ID. Tous droits réservés. République de Madagascar.
          </p>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-vert rounded-full"></div>
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Souveraineté Numérique</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
