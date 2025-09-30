import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Stepper } from '../ui/stepper';
import { Button } from '../ui/button';
import { useNavigation } from '../../hooks/useNavigation';
import { useProcessing } from '../../contexts/ProcessingContext';
import UploadComponent from '../UploadComponent';
import ProgressBar from '../layout/ProgressBar';
import { ProcessingStep } from '../../types/navigation';
import { ArrowRight } from 'lucide-react';
import { usePlaceholders } from '../../hooks/usePlaceholders';

const UploadPage: React.FC = () => {
  const { navigationState, markStepCompleted, goToNextStep, canGoToStep } = useNavigation();
  const { addFiles, files } = useProcessing();
  const { getProcessingStatus } = usePlaceholders();

  const handleUpload = (uploadedFiles: File[]) => {
    addFiles(uploadedFiles);
    // Помечаем шаг загрузки как завершенный
    markStepCompleted('upload');
  };

  const handleNextStep = () => {
    if (canGoToStep('preprocess')) {
      goToNextStep();
    }
  };

  const steps = [
    { id: 'upload', title: 'Загрузка', description: 'Загрузка документов' },
    { id: 'preprocess', title: 'Предобработка', description: 'Обработка изображений' },
    { id: 'ocr', title: 'OCR', description: 'Распознавание текста' },
    { id: 'verify', title: 'Верификация', description: 'Проверка результатов' },
    { id: 'report', title: 'Отчёт', description: 'Генерация отчёта' },
    { id: 'statistics', title: 'Статистика', description: 'Анализ результатов' },
  ];

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок страницы */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Загрузка документов
          </h1>
          <p className="text-sm text-gray-600">
            Загрузите документы для автоматического извлечения и индексирования данных
          </p>
        </div>

        {/* Stepper */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Этапы обработки</CardTitle>
            <CardDescription className="text-sm">
              Отслеживайте прогресс обработки документов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Stepper
              currentStep={navigationState.currentStep}
              completedSteps={navigationState.completedSteps}
              steps={steps.map(step => ({
                ...step,
                id: step.id as ProcessingStep
              }))}
            />
          </CardContent>
        </Card>

        {/* Progress Bar */}
        {files.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Прогресс обработки</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressBar />
            </CardContent>
          </Card>
        )}

        {/* Компонент загрузки */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Загрузка файлов</CardTitle>
            <CardDescription className="text-sm">
              Поддерживаемые форматы: JPG, JPEG, TIFF, PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadComponent
              onUpload={handleUpload}
              maxFiles={20}
              maxFileSize={100 * 1024 * 1024} // 100MB
            />
          </CardContent>
        </Card>

        {/* Список загруженных файлов */}
        {files.length > 0 && (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Загруженные файлы ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{file.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        file.processingStatus === 'completed' ? 'bg-green-100 text-green-800' :
                        file.processingStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                        file.processingStatus === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getProcessingStatus(file.processingStatus)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Кнопка перехода к следующему этапу */}
              {navigationState.completedSteps.includes('upload') && (
                <div className="mt-4 pt-4 border-t">
                  <Button
                    onClick={handleNextStep}
                    className="w-full"
                    size="lg"
                  >
                    Перейти к предобработке
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
