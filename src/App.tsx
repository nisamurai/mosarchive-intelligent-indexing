import { useState } from 'react';
import UploadComponent from './components/UploadComponent';
import './index.css';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Обработчик загрузки файлов
  const handleUpload = (files: File[]) => {
    console.log('Загружены файлы:', files);
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Здесь будет вызов ИИ для обработки документов (заглушка)
    console.log('Отправка файлов на обработку ИИ...');
    
    // Симуляция обработки ИИ
    setTimeout(() => {
      console.log('ИИ обработал документы:', files.map(f => f.name));
    }, 2000);
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

        {/* Список загруженных файлов */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Загруженные файлы ({uploadedFiles.length})
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="text-sm text-green-600">
                      ✓ Обработан ИИ
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
