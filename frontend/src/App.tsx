import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ProcessingProvider } from './contexts/ProcessingContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './components/pages/LoginPage';
import UploadPage from './components/pages/UploadPage';
import PreprocessPage from './components/pages/PreprocessPage';
import OcrPage from './components/pages/OcrPage';
import VerifyPage from './components/pages/VerifyPage';
import ReportPage from './components/pages/ReportPage';
import StatsPage from './components/pages/StatsPage';
import { useAuth } from './contexts/AuthContext';
import { useEffect } from 'react';
import './index.css';

// Компонент для редиректа авторизованных пользователей на страницу загрузки
const AuthRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем, была ли это перезагрузка страницы
    const isPageReload = sessionStorage.getItem('pageReloaded') === 'true';
    
    // Если пользователь авторизован, это перезагрузка страницы и НЕ находится на странице загрузки
    if (!isLoading && isAuthenticated && isPageReload && location.pathname !== '/upload') {
      navigate('/upload', { replace: true });
    }
    
    // Очищаем флаг после обработки
    if (isPageReload) {
      sessionStorage.removeItem('pageReloaded');
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  return null;
};

// Главный компонент приложения с роутингом
function App() {
  // Устанавливаем флаг перезагрузки при выгрузке страницы
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('pageReloaded', 'true');
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // F5 или Ctrl+R
      if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        sessionStorage.setItem('pageReloaded', 'true');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <AuthProvider>
      <NavigationProvider>
        <ProcessingProvider>
          <Router>
            <AuthRedirect />
            <Routes>
              {/* Страница авторизации - без Layout */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Защищенные маршруты - с Layout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <UploadPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/upload" element={
                <ProtectedRoute>
                  <Layout>
                    <UploadPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/preprocess" element={
                <ProtectedRoute>
                  <Layout>
                    <PreprocessPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/ocr" element={
                <ProtectedRoute>
                  <Layout>
                    <OcrPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/verify" element={
                <ProtectedRoute>
                  <Layout>
                    <VerifyPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/report" element={
                <ProtectedRoute>
                  <Layout>
                    <ReportPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/statistics" element={
                <ProtectedRoute>
                  <Layout>
                    <StatsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Перенаправление на главную страницу */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ProcessingProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}

export default App;