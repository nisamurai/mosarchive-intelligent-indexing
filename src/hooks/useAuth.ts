import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const useAuth = () => {
  const authContext = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authContext.isAuthenticated && !authContext.isLoading) {
      navigate('/login');
    }
  }, [authContext.isAuthenticated, authContext.isLoading, navigate]);

  const logout = async () => {
    await authContext.logout();
    navigate('/login');
  };

  return {
    ...authContext,
    logout,
  };
};
