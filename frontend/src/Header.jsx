import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Bell } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isLandingPage = location.pathname === '/';

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-vert to-vert-dark rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-vert/20">
            T
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tighter">TOKANA-ID</span>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          {!user ? (
            !isAuthPage && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-vert transition"
                >
                  Connexion
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-6 py-2.5 bg-vert text-white text-sm font-bold rounded-xl hover:bg-vert-dark transition shadow-lg shadow-vert/20"
                >
                  S'inscrire
                </button>
              </div>
            )
          ) : (
            <div className="flex items-center gap-6">
              <button className="text-gray-400 hover:text-vert transition relative">
                <Bell size={22} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-rouge rounded-full border-2 border-white"></span>
              </button>
              
              <div className="h-8 w-px bg-gray-100"></div>
              
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-vert transition">{user.username}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.role}</p>
                </div>
                <div className="w-10 h-10 bg-vert-light rounded-xl flex items-center justify-center text-vert border border-vert/10 group-hover:scale-105 transition">
                  <User size={20} />
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="p-2.5 text-gray-400 hover:text-rouge hover:bg-rouge-light rounded-xl transition"
                title="Déconnexion"
              >
                <LogOut size={22} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
