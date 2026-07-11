import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Callback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data);
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        navigate('/', { replace: true, state: { error: 'Authentication failed' } });
      });
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="font-podium text-sky-100 text-3xl sm:text-4xl uppercase tracking-wider animate-pulse">
        AUTHENTICATING...
      </p>
    </div>
  );
}
