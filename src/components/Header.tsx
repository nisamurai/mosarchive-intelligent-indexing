import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Логотип и название */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                MosArchive
              </h1>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">
                Интеллектуальное индексирование документов
              </p>
            </div>
          </div>

          {/* Информация о пользователе и кнопка выхода */}
          <div className="flex items-center space-x-4">
            {/* Информация о пользователе */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.username}</p>
                {user.email && (
                  <p className="text-gray-500">{user.email}</p>
                )}
              </div>
            </div>

            {/* Кнопка настроек */}
            <button
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Настройки"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Кнопка выхода */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Выйти из системы"
            >
              <LogOut className="w-4 h-4" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
