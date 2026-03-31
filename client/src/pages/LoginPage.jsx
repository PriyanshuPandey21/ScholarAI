import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { GraduationCap, Github } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-600/15 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }} className="glass rounded-3xl p-10 w-full max-w-md text-center relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow mb-4"><GraduationCap size={32} className="text-white" /></div>
          <h1 className="text-2xl font-display font-bold gradient-text">Welcome to ScholarAI</h1>
          <p className="text-gray-500 text-sm mt-2">Sign in to access all your academic tools</p>
        </div>
        <div className="flex flex-col gap-4 mb-8">
          <a href={`${API_URL}/auth/google`} className="flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all font-medium text-white">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z"/><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"/><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
            Continue with Google
          </a>
          <a href={`${API_URL}/auth/github`} className="flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all font-medium text-white">
            <Github size={20} /> Continue with GitHub
          </a>
        </div>
        <div className="border-t border-white/5 pt-6">
          <p className="text-gray-600 text-xs">By continuing, you agree to our Terms of Service. Your data is encrypted and never shared.</p>
        </div>
        <Link to="/" className="text-gray-600 hover:text-gray-400 text-sm mt-4 inline-block transition-colors">← Back to Home</Link>
      </motion.div>
    </div>
  );
}
