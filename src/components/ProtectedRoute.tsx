import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthPage from './AuthPage';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Показываем загрузку во время проверки авторизации
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, показываем страницу авторизации
  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  // Если пользователь авторизован, показываем защищенный контент
  return <>{children}</>;
};

export default ProtectedRoute;
