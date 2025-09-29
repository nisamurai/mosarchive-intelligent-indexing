import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import './index.css';

// Главный компонент приложения с роутингом
function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <ProcessingProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Страница авторизации */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Защищенные маршруты */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/upload" element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/preprocess" element={
                  <ProtectedRoute>
                    <PreprocessPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/ocr" element={
                  <ProtectedRoute>
                    <OcrPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/verify" element={
                  <ProtectedRoute>
                    <VerifyPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/report" element={
                  <ProtectedRoute>
                    <ReportPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/statistics" element={
                  <ProtectedRoute>
                    <StatsPage />
                  </ProtectedRoute>
                } />
                
                {/* Перенаправление на главную страницу */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Router>
        </ProcessingProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}

export default App;