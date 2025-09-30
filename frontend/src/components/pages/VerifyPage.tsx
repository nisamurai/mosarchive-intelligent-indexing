import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Stepper } from '../ui/stepper';
import { Button } from '../ui/button';
import { useNavigation } from '../../hooks/useNavigation';
import { useProcessing } from '../../contexts/ProcessingContext';
import { CheckCircle, Edit, Eye, FileText, ArrowRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { ProcessingStep } from '../../types/navigation';
import { usePlaceholders } from '../../hooks/usePlaceholders';
import { AttributeHighlightedText, AttributeList } from '../AttributeHighlightedText';

const VerifyPage: React.FC = () => {
  const { navigationState, markStepCompleted, goToNextStep, canGoToStep } = useNavigation();
  const { files } = useProcessing();
  const [selectedFile, setSelectedFile] = React.useState<number | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [verifiedFiles, setVerifiedFiles] = React.useState<Set<string>>(new Set());
  const [imageScale, setImageScale] = React.useState(1);
  const [imageRotation, setImageRotation] = React.useState(0);
  const [showAttributes, setShowAttributes] = React.useState(false);
  const { getTextPlaceholder } = usePlaceholders();

  // Моковые данные для демонстрации атрибутов
  const mockAttributes = {
    fio: "Иванов И.И.",
    date: "05.04.1960",
    address: "",
    archive_code: "XX/1234",
    document_number: "Дело №123",
    organization: ""
  };

  const mockAttributesWithPositions = {
    fio: [{ value: "Иванов И.И.", start: 45, end: 56 }],
    date: [{ value: "05.04.1960", start: 58, end: 68 }],
    address: [],
    archive_code: [{ value: "XX/1234", start: 80, end: 88 }],
    document_number: [{ value: "Дело №123", start: 0, end: 9 }],
    organization: []
  };

  const handleStartVerification = () => {
    // Здесь будет логика верификации
    console.log('Запуск верификации...');
    markStepCompleted('verify');
  };

  const handleVerifyFile = (fileName: string) => {
    setVerifiedFiles(prev => new Set([...prev, fileName]));
  };

  const handleZoomIn = () => {
    setImageScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setImageScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setImageScale(1);
    setImageRotation(0);
  };

  const handleRotate = () => {
    setImageRotation(prev => (prev + 90) % 360);
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
                <div key={index} className={`border rounded-lg p-4 transition-all duration-200 ${
                  verifiedFiles.has(file.file.name) 
                    ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                    : 'hover:bg-gray-50'
                }`}>
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
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        verifiedFiles.has(file.file.name)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {verifiedFiles.has(file.file.name) ? 'Утвержден' : 'Распознан'}
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
                        className={verifiedFiles.has(file.file.name) ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        {verifiedFiles.has(file.file.name) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Утверждено
                          </>
                        ) : (
                          'Утвердить'
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Предварительный просмотр текста */}
                  {selectedFile === index && (
                    <div className="mt-4 space-y-4">
                      {/* Изображение с масштабированием */}
                      <div className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Изображение документа</h4>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleZoomOut}
                              disabled={imageScale <= 0.5}
                            >
                              <ZoomOut className="w-4 h-4" />
                            </Button>
                            <span className="px-2 py-1 text-sm bg-gray-100 rounded">
                              {Math.round(imageScale * 100)}%
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleZoomIn}
                              disabled={imageScale >= 3}
                            >
                              <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRotate}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleResetZoom}
                            >
                              Сброс
                            </Button>
                          </div>
                        </div>
                        <div className="border rounded-lg overflow-hidden bg-gray-50 min-h-[300px] flex items-center justify-center">
                          <div 
                            className="transition-transform duration-200"
                            style={{ 
                              transform: `scale(${imageScale}) rotate(${imageRotation}deg)`,
                              transformOrigin: 'center'
                            }}
                          >
                            <div className="text-center text-gray-500 p-8">
                              <FileText className="w-16 h-16 mx-auto mb-4" />
                              <p className="text-lg font-medium">Изображение документа</p>
                              <p className="text-sm text-gray-400 mt-2">
                                {file.file.name}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Масштаб: {Math.round(imageScale * 100)}% | Поворот: {imageRotation}°
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Текстовое поле для редактирования */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Распознанный текст</h4>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAttributes(!showAttributes)}
                              className={showAttributes ? 'bg-green-100 border-green-300' : ''}
                            >
                              {showAttributes ? 'Скрыть атрибуты' : 'Показать атрибуты'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditing(!isEditing)}
                              className={isEditing ? 'bg-blue-100 border-blue-300' : ''}
                            >
                              {isEditing ? <Eye className="w-4 h-4 mr-1" /> : <Edit className="w-4 h-4 mr-1" />}
                              {isEditing ? 'Просмотр' : 'Редактировать'}
                            </Button>
                          </div>
                        </div>
                        
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-blue-600">
                              <Edit className="w-4 h-4" />
                              <span>Режим редактирования активен</span>
                            </div>
                            <textarea
                              className="w-full h-64 p-3 border-2 border-blue-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50 transition-all duration-200"
                              defaultValue={file.recognizedText || getTextPlaceholder('ocr_placeholder')}
                              placeholder={getTextPlaceholder('edit_placeholder')}
                            />
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Используйте Ctrl+Z для отмены изменений</span>
                              <span>Нажмите "Просмотр" для выхода из режима редактирования</span>
                            </div>
                          </div>
                        ) : showAttributes ? (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-sm text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>Режим просмотра атрибутов активен</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto bg-green-50 border-2 border-green-200 rounded-lg p-3 transition-all duration-200">
                              <AttributeHighlightedText
                                text={file.recognizedText || getTextPlaceholder('ocr_placeholder')}
                                attributes={mockAttributesWithPositions}
                              />
                            </div>
                            <AttributeList
                              attributes={mockAttributes}
                              className="bg-green-50 border-2 border-green-200 rounded-lg p-3 transition-all duration-200"
                            />
                          </div>
                        ) : (
                          <div className="max-h-64 overflow-y-auto bg-white border rounded-lg p-3">
                            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                              {file.recognizedText || getTextPlaceholder('ocr_placeholder')}
                            </pre>
                          </div>
                        )}
                      </div>
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
