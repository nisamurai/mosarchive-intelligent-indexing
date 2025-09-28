import { useState } from 'react';
import UploadComponent from './components/UploadComponent';
import './index.css';

// Интерфейс для обработанного файла с результатами
interface ProcessedFile {
  file: File;
  recognizedText?: string;
  processingStatus: 'completed' | 'error';
  processedAt: Date;
}

function App() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProcessedFile | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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

        {/* Список обработанных файлов с результатами */}
        {processedFiles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Обработанные документы ({processedFiles.length})
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-3">
                {processedFiles.map((processedFile, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{processedFile.file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(processedFile.file.size / (1024 * 1024)).toFixed(2)} MB • 
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
  );
}

export default App;
