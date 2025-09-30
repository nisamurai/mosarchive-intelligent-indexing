import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userInfo: User) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:8000';

  // Проверка авторизации при загрузке приложения
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      // Проверяем сначала localStorage, затем sessionStorage
      let storedToken = localStorage.getItem('authToken');
      let storedUser = localStorage.getItem('userInfo');
      
      if (!storedToken || !storedUser) {
        storedToken = sessionStorage.getItem('authToken');
        storedUser = sessionStorage.getItem('userInfo');
      }

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return false;
      }

      // Временно отключаем проверку токена на сервере для демонстрации
      // TODO: Включить проверку токена когда бэкенд будет готов
      try {
        const response = await fetch(`${API_BASE_URL}/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const userInfo = await response.json();
          setToken(storedToken);
          setUser(userInfo);
          setIsLoading(false);
          return true;
        } else {
          // Если токен недействителен, очищаем хранилище
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('userInfo');
          setIsLoading(false);
          return false;
        }
      } catch (error) {
        console.warn('Ошибка проверки токена на сервере, используем локальные данные:', error);
        // Если сервер недоступен, используем локальные данные
        const userInfo = JSON.parse(storedUser);
        setUser(userInfo);
        setToken(storedToken);
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
      // В случае ошибки сети очищаем данные из обоих хранилищ
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userInfo');
      setToken(null);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  const login = (newToken: string, userInfo: User) => {
    setToken(newToken);
    setUser(userInfo);
    // Данные уже сохранены в AuthPage, здесь только обновляем состояние
  };

  const logout = async () => {
    try {
      // Вызываем logout на сервере (опционально)
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      // Очищаем данные независимо от результата запроса
      setToken(null);
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userInfo');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
