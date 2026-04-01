import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');

    if (!token) {
      navigate('/login?error=oauth', { replace: true });
      return;
    }

    // login() synchronously writes to localStorage AND sets the Axios
    // Authorization header before returning. We then navigate in the same
    // call-stack tick, so ProtectedRoute will see a valid token immediately.
    login(token);

    // Use replace so the browser Back button skips this callback page.
    navigate('/app', { replace: true });
  }, [login, navigate, params]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Signing you in…</p>
    </div>
  );
}
