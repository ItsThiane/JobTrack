import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';
import { LogOut, Settings, Home, FileText } from 'lucide-react';

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    showToast.info('Déconnexion réussie');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">JobTrack</div>

        {user && (
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition ${
                  isActive('/dashboard')
                    ? 'bg-white text-indigo-600 font-semibold'
                    : 'hover:bg-indigo-700'
                }`}
              >
                <Home size={18} />
                Dashboard
              </button>
              <button
                onClick={() => navigate('/candidatures/new')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition ${
                  isActive('/candidatures/new')
                    ? 'bg-white text-indigo-600 font-semibold'
                    : 'hover:bg-indigo-700'
                }`}
              >
                <FileText size={18} />
                Nouvelle candidature
              </button>
            </div>

            <div className="flex items-center gap-4 border-l border-indigo-400 pl-4">
              <div className="text-sm">
                <p className="font-semibold">{user.prenom} {user.nom}</p>
                <p className="text-indigo-200 text-xs">{user.statut}</p>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="p-2 hover:bg-indigo-700 rounded transition"
                title="Profil"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-500 rounded transition"
                title="Déconnexion"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
