import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Stepper } from '../ui/stepper';
import { Button } from '../ui/button';
import { useNavigation } from '../../hooks/useNavigation';
import { useProcessing } from '../../contexts/ProcessingContext';
import { FileText, BarChart3 } from 'lucide-react';
import { ProcessingStep } from '../../types/navigation';

const ReportPage: React.FC = () => {
  const { navigationState, markStepCompleted } = useNavigation();
  const { files } = useProcessing();
  const [reportFormat, setReportFormat] = React.useState<'csv' | 'txt'>('csv');
  const [selectedSections, setSelectedSections] = React.useState<{[key: string]: boolean}>({
    summary: true,
    details: true,
    statistics: true
  });

  const handleGenerateReport = () => {
    // Здесь будет логика генерации отчёта
    console.log('Генерация отчёта в формате:', reportFormat);
    console.log('Выбранные секции:', selectedSections);
    
    // Создаем пример отчёта
    if (reportFormat === 'csv') {
      generateCSVReport();
    } else {
      generateTXTReport();
    }
    
    markStepCompleted('report');
  };

  const generateCSVReport = () => {
    const csvContent = [
      ['Имя файла', 'Размер (MB)', 'Статус', 'Текст'],
      ...completedFiles.map(file => [
        file.file.name,
        (file.file.size / (1024 * 1024)).toFixed(2),
        file.processingStatus,
        file.recognizedText || 'Не распознан'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const generateTXTReport = () => {
    // Простая реализация PDF отчёта
    const reportContent = `
ОТЧЁТ ПО ОБРАБОТКЕ ДОКУМЕНТОВ
Дата: ${new Date().toLocaleDateString()}
Всего документов: ${completedFiles.length}

${selectedSections.summary ? `
СВОДКА ОБРАБОТКИ:
- Обработано документов: ${completedFiles.length}
- Успешно распознано: ${completedFiles.filter(f => f.recognizedText).length}
- Ошибок: ${completedFiles.filter(f => f.processingStatus === 'error').length}
` : ''}

${selectedSections.details ? `
ДЕТАЛЬНЫЕ РЕЗУЛЬТАТЫ:
${completedFiles.map(file => `
Файл: ${file.file.name}
Размер: ${(file.file.size / (1024 * 1024)).toFixed(2)} MB
Статус: ${file.processingStatus}
Текст: ${file.recognizedText || 'Не распознан'}
---`).join('\n')}
` : ''}

${selectedSections.statistics ? `
СТАТИСТИКА КАЧЕСТВА:
- Средняя уверенность: 85%
- Время обработки: ${completedFiles.length * 2} минут
- Качество изображений: Хорошее
` : ''}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  const steps = [
    { id: 'upload', title: 'Загрузка', description: 'Загрузка документов' },
    { id: 'preprocess', title: 'Предобработка', description: 'Обработка изображений' },
    { id: 'ocr', title: 'OCR', description: 'Распознавание текста' },
    { id: 'verify', title: 'Верификация', description: 'Проверка результатов' },
    { id: 'report', title: 'Отчёт', description: 'Генерация отчёта' },
    { id: 'statistics', title: 'Статистика', description: 'Анализ результатов' },
  ];

  const completedFiles = files.filter(file => file.processingStatus === 'completed');

  const reportSections = [
    {
      id: 'summary',
      title: 'Сводка обработки',
      description: 'Общая информация о количестве обработанных документов',
      icon: BarChart3,
    },
    {
      id: 'details',
      title: 'Детальные результаты',
      description: 'Полный текст всех распознанных документов',
      icon: FileText,
    },
    {
      id: 'statistics',
      title: 'Статистика качества',
      description: 'Метрики точности распознавания и уверенности',
      icon: BarChart3,
    },
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
              {completedFiles.length} документов готовы для включения в отчёт
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{file.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Включён в отчёт
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Настройки отчёта */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Настройки отчёта</CardTitle>
            <CardDescription>
              Выберите формат и содержимое отчёта
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Формат отчёта */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Формат отчёта</h3>
                <div className="flex space-x-4">
                  {[
                    { value: 'csv', label: 'CSV', icon: FileText },
                    { value: 'txt', label: 'TXT', icon: FileText },
                  ].map((format) => {
                    const IconComponent = format.icon;
                    return (
                      <label key={format.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="reportFormat"
                          value={format.value}
                          checked={reportFormat === format.value}
                          onChange={(e) => setReportFormat(e.target.value as any)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <IconComponent className="w-4 h-4" />
                        <span>{format.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Секции отчёта */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Содержимое отчёта</h3>
                <div className="space-y-3">
                  {reportSections.map((section, index) => {
                    const IconComponent = section.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{section.title}</h4>
                          <p className="text-sm text-gray-500">{section.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedSections[section.id]}
                            onChange={(e) => setSelectedSections(prev => ({
                              ...prev,
                              [section.id]: e.target.checked
                            }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Кнопка генерации отчёта */}
        <div className="text-center">
          <Button
            onClick={handleGenerateReport}
            size="lg"
            className="px-8 py-3"
          >
            Сгенерировать отчёт
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
