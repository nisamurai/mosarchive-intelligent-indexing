import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, Mail } from 'lucide-react';
import { usePlaceholders } from '../hooks/usePlaceholders';

interface RegisterFormProps {
  onRegister: (username: string, password: string, email?: string) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading?: boolean;
  error?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegister,
  onSwitchToLogin,
  isLoading = false,
  error
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  });
  const { getTextPlaceholder } = usePlaceholders();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очистка ошибки валидации при изменении поля
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Валидация логина
    if (!formData.username.trim()) {
      errors.username = 'Введите логин';
    } else if (formData.username.length < 3) {
      errors.username = 'Логин должен содержать минимум 3 символа';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Логин может содержать только буквы, цифры и подчеркивания';
    }
    
    // Валидация email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Введите корректный email адрес';
    }
    
    // Валидация пароля
    if (!formData.password) {
      errors.password = 'Введите пароль';
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Пароль должен содержать заглавные и строчные буквы, а также цифры';
    }
    
    // Валидация подтверждения пароля
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onRegister(
        formData.username, 
        formData.password, 
        formData.email || undefined
      );
    } catch (err) {
      // Ошибка обрабатывается в родительском компоненте
    }
  };

  const isFormValid = formData.username.trim() && 
                     formData.password && 
                     formData.confirmPassword &&
                     formData.password === formData.confirmPassword;

  return (
    <div className="space-y-6">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-4 text-center text-2xl font-extrabold text-gray-900">
            Регистрация
          </h2>
          <p className="mt-1 text-center text-sm text-gray-600">
            Создайте новый аккаунт для доступа к системе
          </p>
        </div>
        
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            {/* Поле логина */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Логин *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 border ${
                    validationErrors.username 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:z-10 sm:text-sm`}
                  placeholder={getTextPlaceholder('login_placeholder')}
                />
              </div>
              {validationErrors.username && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
              )}
            </div>

            {/* Поле email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email (необязательно)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 border ${
                    validationErrors.email 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:z-10 sm:text-sm`}
                  placeholder={getTextPlaceholder('email_placeholder')}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Поле пароля */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Пароль *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none rounded-lg relative block w-full pl-10 pr-10 py-2 border ${
                    validationErrors.password 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:z-10 sm:text-sm`}
                  placeholder={getTextPlaceholder('password_placeholder')}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            {/* Поле подтверждения пароля */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Подтверждение пароля *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`appearance-none rounded-lg relative block w-full pl-10 pr-10 py-2 border ${
                    validationErrors.confirmPassword 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:z-10 sm:text-sm`}
                  placeholder={getTextPlaceholder('confirm_password_placeholder')}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Сообщение об ошибке */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Ошибка регистрации
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Кнопка регистрации */}
          <div>
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                !isFormValid || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              } transition-colors duration-200`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Регистрация...
                </div>
              ) : (
                'Зарегистрироваться'
              )}
            </button>
          </div>

          {/* Ссылка на вход */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-green-600 hover:text-green-500 focus:outline-none"
              >
                Войти
              </button>
            </p>
          </div>
        </form>
    </div>
  );
};

export default RegisterForm;
