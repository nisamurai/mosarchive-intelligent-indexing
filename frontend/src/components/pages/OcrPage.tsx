import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Stepper } from '../ui/stepper';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useNavigation } from '../../hooks/useNavigation';
import { useProcessing } from '../../contexts/ProcessingContext';
import { FileText, Brain, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { ProcessingStep } from '../../types/navigation';

const OcrPage: React.FC = () => {
  const { navigationState, markStepCompleted, goToNextStep, canGoToStep } = useNavigation();
  const { files, updateFileText } = useProcessing();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const handleStartOCR = () => {
    setIsProcessing(true);
    setProgress(0);
    
    // Симуляция OCR обработки с обновлением текста для каждого файла
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          markStepCompleted('ocr');
          return 100;
        }
        
        // Обновляем текст для файлов по мере прогресса
        const currentFileIndex = Math.floor(prev / (100 / files.length));
        if (currentFileIndex < files.length) {
          const sampleText = `Распознанный текст из документа ${files[currentFileIndex].file.name}:\n\nЭто пример распознанного текста. Здесь может быть любой контент, извлеченный из изображения документа.\n\nДата: ${new Date().toLocaleDateString()}\nНомер документа: DOC-${currentFileIndex + 1}\nСтатус: Обработан`;
          // Используем setTimeout для отложенного обновления состояния
          setTimeout(() => {
            updateFileText(files[currentFileIndex].file.name, sampleText);
          }, 0);
        }
        
        return prev + 10;
      });
    }, 500);
  };

  const handleNextStep = () => {
    if (canGoToStep('verify')) {
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

  const ocrFeatures = [
    {
      title: 'Распознавание текста',
      description: 'Извлечение текста из изображений с высокой точностью',
      icon: FileText,
    },
    {
      title: 'ИИ-анализ',
      description: 'Использование искусственного интеллекта для улучшения качества',
      icon: Brain,
    },
    {
      title: 'Метаданные',
      description: 'Извлечение структурированных данных (даты, имена, адреса)',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок страницы */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Распознавание текста (OCR)
          </h1>
          <p className="text-gray-600">
            Автоматическое извлечение текста и метаданных из документов
          </p>
        </div>

        {/* Stepper */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Этапы обработки</CardTitle>
            <CardDescription>
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

        {/* Информация о файлах */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Файлы для OCR</CardTitle>
            <CardDescription>
              {files.length} файлов готовы к распознаванию
            </CardDescription>
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
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Готов к OCR
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Возможности OCR */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Возможности OCR</CardTitle>
            <CardDescription>
              Современные алгоритмы распознавания текста
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ocrFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <div className="flex justify-center mb-3">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Прогресс обработки */}
        {isProcessing && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Обработка документов</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Прогресс: {progress}%</span>
                  <span>Обработано: {Math.floor(progress * files.length / 100)} из {files.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Кнопка запуска */}
        <div className="text-center">
          {!navigationState.completedSteps.includes('ocr') ? (
            <Button
              onClick={handleStartOCR}
              size="lg"
              className="px-8 py-3"
              disabled={isProcessing}
            >
              {isProcessing ? 'Обработка...' : 'Запустить OCR'}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="text-green-600 font-medium">
                OCR обработка завершена успешно!
              </div>
              <Button
                onClick={handleNextStep}
                size="lg"
                className="px-8 py-3"
              >
                Перейти к верификации
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OcrPage;
