import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthPageProps {
  onAuthSuccess: (token: string, userInfo: any) => void;
}

type AuthMode = 'login' | 'register';

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const API_BASE_URL = 'http://localhost:8000';

  const handleLogin = async (username: string, password: string, rememberMe?: boolean) => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Отправка запроса входа:', { username, url: `${API_BASE_URL}/login` });
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Ответ сервера:', { status: response.status, ok: response.ok });

      const data = await response.json();
      console.log('Данные ответа:', data);

      if (!response.ok) {
        throw new Error(data.detail || 'Ошибка авторизации');
      }

      // Получаем информацию о пользователе
      const userResponse = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      });

      const userInfo = await userResponse.json();

      // Сохраняем токен в зависимости от настройки "запомнить меня"
      if (rememberMe) {
        localStorage.setItem('authToken', data.access_token);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      } else {
        sessionStorage.setItem('authToken', data.access_token);
        sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
      }

      onAuthSuccess(data.access_token, userInfo);
    } catch (err) {
      console.error('Ошибка входа:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (username: string, password: string, email?: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Отправка запроса регистрации:', { username, email, url: `${API_BASE_URL}/register` });
      
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          password, 
          email: email || null 
        }),
      });

      console.log('Ответ сервера:', { status: response.status, ok: response.ok });

      const data = await response.json();
      console.log('Данные ответа:', data);

      if (!response.ok) {
        throw new Error(data.detail || 'Ошибка регистрации');
      }

      // После успешной регистрации автоматически входим в систему
      const loginResponse = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!loginResponse.ok) {
        throw new Error('Ошибка автоматического входа после регистрации');
      }

      const loginData = await loginResponse.json();

      // Получаем информацию о пользователе
      const userResponse = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${loginData.access_token}`,
        },
      });

      const userInfo = await userResponse.json();

      // При регистрации всегда сохраняем в localStorage (по умолчанию "запомнить меня")
      localStorage.setItem('authToken', loginData.access_token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      onAuthSuccess(loginData.access_token, userInfo);
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const switchToLogin = () => {
    setMode('login');
    setError('');
  };

  const switchToRegister = () => {
    setMode('register');
    setError('');
  };

  return (
    <div>
      {mode === 'login' ? (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToRegister={switchToRegister}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <RegisterForm
          onRegister={handleRegister}
          onSwitchToLogin={switchToLogin}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
};

export default AuthPage;
