import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import UploadComponent from './components/UploadComponent';
import VerifyPage from './components/VerifyPage';
import ReportConstructor from './components/ReportConstructor';
import StatisticsComponent from './components/StatisticsComponent';
import { adaptProcessedFile, createSampleData } from './lib/documentDataAdapter';
import './index.css';

// Интерфейс для обработанного файла с результатами
interface ProcessedFile {
  file: File;
  recognizedText?: string;
  processingStatus: 'completed' | 'error';
  processedAt: Date;
}

// Состояние приложения для верификации
type AppState = 'upload' | 'verify' | 'report' | 'statistics';

// Компонент основного приложения (защищенный контент)
function AppContent() {
  const [, setUploadedFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProcessedFile | null>(null);
  const [currentState, setCurrentState] = useState<AppState>('upload');
  const [verifyFile, setVerifyFile] = useState<ProcessedFile | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // Функция для получения данных в формате для отчёта
  const getReportData = () => {
    // Если есть обработанные файлы, используем их
    if (processedFiles.length > 0) {
      return processedFiles.map(adaptProcessedFile);
    }
    
    // Если файлов нет, создаём тестовые данные для демонстрации
    return createSampleData(5);
  };

  // Обработчик загрузки файлов
  const handleUpload = (files: File[]) => {
    console.log('Загружены файлы:', files);
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Здесь будет вызов ИИ для обработки документов (заглушка)
    console.log('Отправка файлов на обработку ИИ...');
    
    // Симуляция обработки ИИ с результатами распознавания текста
    setTimeout(() => {
      console.log('ИИ обработал документы:', files.map(f => f.name));
      
      
      // Добавляем обработанные файлы с результатами распознавания
      const newProcessedFiles: ProcessedFile[] = files.map(file => ({
        file,
        recognizedText: `Пример распознанного текста из документа "${file.name}":

ДОКУМЕНТ № ${Math.floor(Math.random() * 10000)}
Дата: ${new Date().toLocaleDateString('ru-RU')}

ЗАЯВЛЕНИЕ

Я, ${['Иванов И.И.', 'Петров П.П.', 'Сидоров С.С.'][Math.floor(Math.random() * 3)]}, прошу рассмотреть мой вопрос о предоставлении архивной справки.

Основание: личное обращение гражданина.

Документы прилагаются:
- Копия паспорта
- Заявление
- Дополнительные документы

Подпись: _________________ Дата: ${new Date().toLocaleDateString('ru-RU')}

Примечание: Документ содержит как печатный, так и рукописный текст. Распознавание выполнено с точностью 95%.`,
        processingStatus: 'completed' as const,
        processedAt: new Date()
      }));
      
      setProcessedFiles(prev => [...prev, ...newProcessedFiles]);
    }, 5000); // Увеличиваем время для демонстрации процесса
  };

  // Обработчик запуска верификации
  const handleVerifyFile = (processedFile: ProcessedFile) => {
    setVerifyFile(processedFile);
    setImageUrl(URL.createObjectURL(processedFile.file));
    setCurrentState('verify');
  };

  // Обработчик сохранения результатов верификации
  const handleSaveVerification = async (editedText: string) => {
    if (!verifyFile) return;
    
    try {
      // Обновляем текст в списке обработанных файлов
      setProcessedFiles(prev => prev.map(file => 
        file.file === verifyFile.file 
          ? { ...file, recognizedText: editedText }
          : file
      ));
      
      console.log('Результаты верификации сохранены:', {
        fileName: verifyFile.file.name,
        originalLength: verifyFile.recognizedText?.length,
        newLength: editedText.length
      });
      
      // Возвращаемся к списку файлов
      setCurrentState('upload');
      
      // Очищаем URL изображения для освобождения памяти
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    } catch (error) {
      console.error('Ошибка при сохранении результатов верификации:', error);
      throw error;
    }
  };

  // Обработчик отмены верификации
  const handleCancelVerification = () => {
    setCurrentState('upload');
    setVerifyFile(null);
    
    // Очищаем URL изображения для освобождения памяти
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl('');
    }
  };

  // Обработчик открытия конструктора отчёта
  const handleOpenReport = () => {
    setCurrentState('report');
  };

  // Обработчик открытия статистики
  const handleOpenStatistics = () => {
    setCurrentState('statistics');
  };

  // Обработчик возврата к главной странице
  const handleBackToMain = () => {
    setCurrentState('upload');
  };

  // Отрисовка компонента верификации
  if (currentState === 'verify' && verifyFile && imageUrl) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <VerifyPage
              imageUrl={imageUrl}
              recognizedText={verifyFile.recognizedText || ''}
              fileName={verifyFile.file.name}
              onSave={handleSaveVerification}
              onCancel={handleCancelVerification}
            />
          </div>
        </div>
      </div>
    );
  }

  // Отрисовка конструктора отчёта
  if (currentState === 'report') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            {/* Заголовок страницы */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Конструктор отчёта
                </h1>
                <p className="text-gray-600">
                  Создайте отчёт по обработанным документам
                </p>
              </div>
              <button
                onClick={handleBackToMain}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Назад к документам
              </button>
            </div>

            <ReportConstructor documents={getReportData()} />
          </div>
        </div>
      </div>
    );
  }

  // Отрисовка страницы статистики
  if (currentState === 'statistics') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            {/* Заголовок страницы */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Статистика обработки
                </h1>
                <p className="text-gray-600">
                  Анализ результатов автоматического распознавания документов
                </p>
              </div>
              <button
                onClick={handleBackToMain}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Назад к документам
              </button>
            </div>

            <StatisticsComponent 
              showChart={true}
              autoRefresh={false}
              refreshInterval={30000}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Сервис извлечения и индексирования информации из образов архивных документов
            </h1>
            <p className="text-gray-600">
              Загрузите документы для автоматического извлечения и индексирования данных
            </p>
          </div>

          {/* Компонент загрузки */}
          <UploadComponent 
            onUpload={handleUpload}
            maxFiles={20}
            maxFileSize={100 * 1024 * 1024} // 100MB
          />

          {/* Кнопки навигации - доступны всегда */}
          <div className="mt-8 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleOpenReport}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Конструктор отчёта
              </button>
              
              <button
                onClick={handleOpenStatistics}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Статистика обработки
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              {processedFiles.length > 0 
                ? `Доступно ${processedFiles.length} документов для анализа` 
                : 'Будут использованы тестовые данные для демонстрации'
              }
            </p>
          </div>

          {/* Список обработанных файлов с результатами */}
          {processedFiles.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Обработанные документы ({processedFiles.length})
                </h2>
                <button
                  onClick={handleOpenReport}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Генерировать отчёт</span>
                </button>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="space-y-3">
                  {processedFiles.map((processedFile, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900">{processedFile.file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(processedFile.file.size / (1024 * 1024)).toFixed(2)} MB  
                            Обработан: {processedFile.processedAt.toLocaleString('ru-RU')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-green-600">✓ Распознан</span>
                          <button
                            onClick={() => setSelectedFile(processedFile)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Показать текст
                          </button>
                          <button
                            onClick={() => handleVerifyFile(processedFile)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors ml-2"
                          >
                            Верификация
                          </button>
                        </div>
                      </div>
                      
                      {/* Предварительный просмотр текста */}
                      {processedFile.recognizedText && (
                        <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 max-h-20 overflow-hidden">
                          {processedFile.recognizedText.substring(0, 200)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Модальное окно с полным текстом */}
          {selectedFile && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Распознанный текст: {selectedFile.file.name}
                  </h3>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                      {selectedFile.recognizedText}
                    </pre>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      if (selectedFile.recognizedText) {
                        navigator.clipboard.writeText(selectedFile.recognizedText);
                      }
                    }}
                    className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Копировать текст
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Главный компонент приложения с авторизацией
function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
