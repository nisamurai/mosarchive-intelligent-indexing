import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Stepper } from '../ui/stepper';
import { Button } from '../ui/button';
import { useNavigation } from '../../hooks/useNavigation';
import { useProcessing } from '../../contexts/ProcessingContext';
import { CheckCircle, Edit, Eye, FileText, ArrowRight } from 'lucide-react';
import { ProcessingStep } from '../../types/navigation';
import { usePlaceholders } from '../../hooks/usePlaceholders';

const VerifyPage: React.FC = () => {
  const { navigationState, markStepCompleted, goToNextStep, canGoToStep } = useNavigation();
  const { files } = useProcessing();
  const [selectedFile, setSelectedFile] = React.useState<number | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [verifiedFiles, setVerifiedFiles] = React.useState<Set<string>>(new Set());
  const { getTextPlaceholder } = usePlaceholders();

  const handleStartVerification = () => {
    // Здесь будет логика верификации
    console.log('Запуск верификации...');
    markStepCompleted('verify');
  };

  const handleVerifyFile = (fileName: string) => {
    setVerifiedFiles(prev => new Set([...prev, fileName]));
  };

  const handleNextStep = () => {
    if (canGoToStep('report')) {
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

  // Показываем все файлы, которые прошли OCR (не только completed)
  const completedFiles = files.filter(file => 
    file.processingStatus === 'completed' || 
    file.processingStatus === 'processing' ||
    (file.recognizedText && file.recognizedText.length > 0)
  );

  const pendingFiles = completedFiles.filter(file => !verifiedFiles.has(file.file.name));
  const verifiedFilesList = completedFiles.filter(file => verifiedFiles.has(file.file.name));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок страницы */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Верификация результатов
          </h1>
          <p className="text-gray-600">
            Проверьте и отредактируйте распознанный текст
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

        {/* Список документов для верификации */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Документы для верификации</CardTitle>
            <CardDescription>
              {pendingFiles.length} документов готовы к проверке
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingFiles.map((file, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{file.file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Распознан
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(selectedFile === index ? null : index)}
                      >
                        {selectedFile === index ? 'Скрыть' : 'Показать'}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleVerifyFile(file.file.name)}
                      >
                        Утвердить
                      </Button>
                    </div>
                  </div>
                  
                  {/* Предварительный просмотр текста */}
                  {selectedFile === index && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Распознанный текст</h4>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(!isEditing)}
                          >
                            {isEditing ? <Eye className="w-4 h-4 mr-1" /> : <Edit className="w-4 h-4 mr-1" />}
                            {isEditing ? 'Просмотр' : 'Редактировать'}
                          </Button>
                        </div>
                      </div>
                      
                      {isEditing ? (
                        <textarea
                          className="w-full h-64 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue={file.recognizedText || getTextPlaceholder('ocr_placeholder')}
                          placeholder={getTextPlaceholder('edit_placeholder')}
                        />
                      ) : (
                        <div className="max-h-64 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                            {file.recognizedText || getTextPlaceholder('ocr_placeholder')}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Статистика верификации */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Статистика верификации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="flex justify-center mb-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900">Проверено</h3>
                <p className="text-2xl font-bold text-green-600">{verifiedFilesList.length}</p>
                <p className="text-sm text-gray-500">документов</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="flex justify-center mb-2">
                  <Edit className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">Отредактировано</h3>
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-500">документов</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="flex justify-center mb-2">
                  <FileText className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="font-medium text-gray-900">Ожидает</h3>
                <p className="text-2xl font-bold text-gray-600">{pendingFiles.length}</p>
                <p className="text-sm text-gray-500">документов</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Кнопка завершения верификации */}
        <div className="text-center">
          {!navigationState.completedSteps.includes('verify') ? (
            <Button
              onClick={handleStartVerification}
              size="lg"
              className="px-8 py-3"
            >
              Завершить верификацию
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="text-green-600 font-medium">
                Верификация завершена успешно!
              </div>
              <Button
                onClick={handleNextStep}
                size="lg"
                className="px-8 py-3"
              >
                Перейти к отчету
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
