import { Menu, LogOut, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/'); };

  return (
    <header className="glass border-b border-glass-border px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
      <button onClick={onMenuClick} className="text-muted hover:text-foreground transition-colors"><Menu size={20} /></button>
      
      <div className="flex items-center gap-2 mr-auto md:hidden">
        <GraduationCap size={20} className="text-primary-400" />
        <span className="font-display font-bold gradient-text">ScholarAI</span>
      </div>

      <div className="ml-auto flex items-center gap-4">        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted">{user.email}</p>
            </div>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full ring-2 ring-primary-500/50" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-sm text-white">
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}
            <button onClick={handleLogout} className="text-muted hover:text-red-400 transition-colors p-2" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
