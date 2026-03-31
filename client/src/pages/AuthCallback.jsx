import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function AuthCallback() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const token = params.get('token');
    if (token) { login(token); navigate('/app', { replace: true }); }
    else navigate('/login?error=oauth', { replace: true });
  }, []);
  return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
}
