import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Stepper } from '../ui/stepper';
import { Button } from '../ui/button';
import { useNavigation } from '../../hooks/useNavigation';
import { useProcessing } from '../../contexts/ProcessingContext';
import { Settings, Image, RotateCcw, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { ProcessingStep } from '../../types/navigation';

const PreprocessPage: React.FC = () => {
  const { navigationState, markStepCompleted, goToNextStep, canGoToStep } = useNavigation();
  const { files } = useProcessing();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcess, setCurrentProcess] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<{[key: string]: boolean}>({
    deskew: true,
    contrast: true,
    denoise: true,
    binarization: true
  });

  const handleOptionChange = (optionId: string, checked: boolean) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: checked
    }));
  };

  const handleStartPreprocessing = () => {
    setIsProcessing(true);
    setCurrentProcess('Инициализация предобработки...');
    
    // Получаем только выбранные процессы
    const selectedProcesses = [];
    
    if (selectedOptions.deskew) {
      selectedProcesses.push('Выравнивание документов...');
    }
    if (selectedOptions.contrast) {
      selectedProcesses.push('Коррекция контрастности...');
    }
    if (selectedOptions.denoise) {
      selectedProcesses.push('Шумоподавление...');
    }
    if (selectedOptions.binarization) {
      selectedProcesses.push('Бинаризация изображений...');
    }
    
    // Добавляем финализацию только если есть выбранные процессы
    if (selectedProcesses.length > 0) {
      selectedProcesses.push('Финализация обработки...');
    }
    
    let processIndex = 0;
    const processInterval = setInterval(() => {
      if (processIndex < selectedProcesses.length) {
        setCurrentProcess(selectedProcesses[processIndex]);
        processIndex++;
      } else {
        clearInterval(processInterval);
        setCurrentProcess('Предобработка завершена!');
        markStepCompleted('preprocess');
        setIsProcessing(false);
      }
    }, 600);
  };

  const handleNextStep = () => {
    if (canGoToStep('ocr')) {
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

  const preprocessingOptions = [
    {
      id: 'deskew',
      title: 'Выравнивание',
      description: 'Автоматическое выравнивание наклоненных документов',
      icon: RotateCcw,
    },
    {
      id: 'contrast',
      title: 'Коррекция контрастности',
      description: 'Улучшение контрастности для лучшего распознавания',
      icon: Settings,
    },
    {
      id: 'denoise',
      title: 'Шумоподавление',
      description: 'Удаление шума и артефактов с изображений',
      icon: Zap,
    },
    {
      id: 'binarization',
      title: 'Бинаризация',
      description: 'Преобразование в черно-белое изображение',
      icon: Image,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок страницы */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Предобработка изображений
          </h1>
          <p className="text-gray-600">
            Настройте параметры предобработки для улучшения качества распознавания
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
            <CardTitle>Файлы для обработки</CardTitle>
            <CardDescription>
              {files.length} файлов готовы к предобработке
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
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Готов к обработке
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Опции предобработки */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Параметры предобработки</CardTitle>
            <CardDescription>
              Выберите алгоритмы для улучшения качества изображений
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preprocessingOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div key={option.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{option.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedOptions[option.id]}
                        onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Отображение текущего процесса */}
        {isProcessing && currentProcess && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Текущий процесс</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-lg font-medium text-blue-600">{currentProcess}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Результаты предобработки - двухколоночный интерфейс */}
        {navigationState.completedSteps.includes('preprocess') && files.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Результаты предобработки</CardTitle>
              <CardDescription>
                Сравнение изображений до и после обработки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {files.map((file, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">{file.file.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Изображение до обработки */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">До обработки</h5>
                        <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <Image className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm">Оригинальное изображение</p>
                            <p className="text-xs text-gray-400">
                              {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Изображение после обработки */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">После обработки</h5>
                        <div className="border rounded-lg p-4 bg-green-50 min-h-[200px] flex items-center justify-center">
                          <div className="text-center text-green-600">
                            <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm">Обработанное изображение</p>
                            <p className="text-xs text-green-500">
                              Применены: {Object.entries(selectedOptions)
                                .filter(([_, enabled]) => enabled)
                                .map(([key, _]) => {
                                  const option = preprocessingOptions.find(opt => opt.id === key);
                                  return option?.title;
                                })
                                .join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Кнопка запуска */}
        <div className="text-center">
          {!navigationState.completedSteps.includes('preprocess') ? (
            <Button
              onClick={handleStartPreprocessing}
              size="lg"
              className="px-8 py-3"
              disabled={isProcessing || Object.values(selectedOptions).every(option => !option)}
            >
              {isProcessing ? 'Обработка...' : 'Запустить предобработку'}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="text-green-600 font-medium">
                Предобработка завершена успешно!
              </div>
              <Button
                onClick={handleNextStep}
                size="lg"
                className="px-8 py-3"
              >
                Перейти к распознаванию текста
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreprocessPage;
