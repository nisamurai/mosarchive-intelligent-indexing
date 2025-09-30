import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Stepper } from '../ui/stepper';
import { Button } from '../ui/button';
import { useNavigation } from '../../hooks/useNavigation';
import { useProcessing } from '../../contexts/ProcessingContext';
import { FileText, ArrowRight } from 'lucide-react';
import { ProcessingStep } from '../../types/navigation';
import ReportConstructorNew from '../ReportConstructorNew';
import { 
  DocumentRecognitionResult, 
  ReportConfiguration, 
  ReportExportResult 
} from '../../types/report';
import { exportReportToCSV } from '../../lib/reportExport';
import { extractArchiveCodeFromPath, createDocumentPageInfo } from '../../lib/archiveUtils';

const ReportPage: React.FC = () => {
  const { navigationState, markStepCompleted, goToStep } = useNavigation();
  const { files } = useProcessing();
  const [documents, setDocuments] = React.useState<DocumentRecognitionResult[]>([]);
  const [lastExportResult, setLastExportResult] = React.useState<ReportExportResult | null>(null);

  // Преобразуем файлы в формат DocumentRecognitionResult
  React.useEffect(() => {
    const processedDocuments: DocumentRecognitionResult[] = files
      .filter(file => file.processingStatus === 'completed')
      .map(file => {
        // Извлекаем архивный шифр из имени файла
        const archiveCode = extractArchiveCodeFromPath(file.file.name);
        
        // Создаём информацию о странице
        const pageInfo = createDocumentPageInfo(file.file.name, archiveCode || undefined);
        
        // Создаём моковые атрибуты для демонстрации
        const attributes = [
          { type: 'fio' as const, value: 'Иванов И.И.', confidence: 0.95 },
          { type: 'date' as const, value: '05.04.1960', confidence: 0.98 },
          { type: 'address' as const, value: 'г. Москва', confidence: 0.87 }
        ];
        
        return {
          archiveCode: archiveCode || {
            archiveId: '01',
            fund: '0203',
            signature: '0745',
            caseNumber: '000002',
            fullCode: '01-0203-0745-000002'
          },
          pageInfo,
          recognitionType: 'attribute' as const,
          attributes,
          fullText: file.recognizedText,
          processingDate: file.processedAt,
          confidence: file.confidence || 0.9
        };
      });
    
    setDocuments(processedDocuments);
  }, [files]);

  const handleExport = (config: ReportConfiguration) => {
    try {
      const result = exportReportToCSV(documents, config);
      setLastExportResult(result);
      markStepCompleted('report');
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      alert('Произошла ошибка при экспорте отчёта');
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок страницы */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Генерация отчёта
          </h1>
          <p className="text-gray-600">
            Создайте отчёт по результатам обработки документов
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

        {/* Информация об обработанных документах */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Обработанные документы</CardTitle>
            <CardDescription>
              {documents.length} документов готовы для включения в отчёт
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{doc.pageInfo.fileName}</p>
                      <p className="text-sm text-gray-500">
                        Архивный шифр: {doc.archiveCode.fullCode}
                      </p>
                      <p className="text-sm text-gray-500">
                        Страница: {doc.pageInfo.pageNumber} | Уверенность: {Math.round(doc.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {doc.recognitionType === 'full' ? 'Сквозное' : 'Атрибутивное'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Конструктор отчёта */}
        <ReportConstructorNew
          documents={documents}
          onExport={handleExport}
          className="mb-8"
        />

        {/* Результат экспорта */}
        {lastExportResult && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-green-600">Отчёт успешно экспортирован</CardTitle>
              <CardDescription>
                Файл: {lastExportResult.fileName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Записей:</p>
                  <p className="font-medium">{lastExportResult.recordsCount}</p>
                </div>
                <div>
                  <p className="text-gray-500">Полей:</p>
                  <p className="font-medium">{lastExportResult.fieldsCount}</p>
                </div>
                <div>
                  <p className="text-gray-500">Размер:</p>
                  <p className="font-medium">{(lastExportResult.fileSize / 1024).toFixed(1)} KB</p>
                </div>
                <div>
                  <p className="text-gray-500">Дата:</p>
                  <p className="font-medium">{lastExportResult.exportDate.toLocaleString('ru-RU')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Кнопки действий */}
        <div className="text-center space-y-4">
          {navigationState.completedSteps.includes('report') && (
            <div className="space-y-4">
              <div className="text-green-600 font-medium">
                Отчёт сформирован успешно!
              </div>
              <Button
                onClick={() => goToStep('statistics')}
                size="lg"
                className="px-8 py-3"
              >
                Перейти к статистике
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
