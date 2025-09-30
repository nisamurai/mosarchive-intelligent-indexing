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