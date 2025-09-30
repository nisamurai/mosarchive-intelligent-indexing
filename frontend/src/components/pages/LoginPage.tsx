import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import AuthPage from '../AuthPage';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuthSuccess = (token: string, userInfo: any) => {
    login(token, userInfo);
    // Перенаправляем на главную страницу после успешной авторизации/регистрации
    navigate('/');
  };

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              MosArchive
            </CardTitle>
            <CardDescription>
              Интеллектуальное индексирование документов
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <AuthPage onAuthSuccess={handleAuthSuccess} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
