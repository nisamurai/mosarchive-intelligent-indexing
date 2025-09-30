import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Stepper } from '../ui/stepper';
import { Button } from '../ui/button';
import { useNavigation } from '../../contexts/NavigationContext';
import { useProcessing } from '../../contexts/ProcessingContext';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { ProcessingStep } from '../../types/navigation';

const StatsPage: React.FC = () => {
  const { navigationState } = useNavigation();
  const { files } = useProcessing();

  const steps = [
    { id: 'upload', title: 'Загрузка', description: 'Загрузка документов' },
    { id: 'preprocess', title: 'Предобработка', description: 'Обработка изображений' },
    { id: 'ocr', title: 'OCR', description: 'Распознавание текста' },
    { id: 'verify', title: 'Верификация', description: 'Проверка результатов' },
    { id: 'report', title: 'Отчёт', description: 'Генерация отчёта' },
    { id: 'statistics', title: 'Статистика', description: 'Анализ результатов' },
  ];

  const completedFiles = files.filter(file => file.processingStatus === 'completed');
  const totalFiles = files.length;
  const successRate = totalFiles > 0 ? Math.round((completedFiles.length / totalFiles) * 100) : 0;

  const stats = [
    {
      title: 'Всего документов',
      value: totalFiles,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Успешно обработано',
      value: completedFiles.length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Процент успеха',
      value: `${successRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Среднее время',
      value: '2.5 мин',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const qualityMetrics = [
    {
      title: 'Высокая уверенность',
      value: Math.round(completedFiles.length * 0.7),
      percentage: 70,
      color: 'bg-green-500',
    },
    {
      title: 'Средняя уверенность',
      value: Math.round(completedFiles.length * 0.25),
      percentage: 25,
      color: 'bg-yellow-500',
    },
    {
      title: 'Низкая уверенность',
      value: Math.round(completedFiles.length * 0.05),
      percentage: 5,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок страницы */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Статистика обработки
          </h1>
          <p className="text-gray-600">
            Анализ результатов автоматического распознавания документов
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

        {/* Основная статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Качество распознавания */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Качество распознавания</CardTitle>
            <CardDescription>
              Распределение документов по уровням уверенности
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {qualityMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${metric.color}`}></div>
                    <span className="font-medium text-gray-900">{metric.title}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{metric.value} документов</span>
                    <span className="text-sm font-medium text-gray-900">{metric.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* График динамики */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Динамика обработки</CardTitle>
            <CardDescription>
              Тренды за последние 7 дней
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">График динамики будет здесь</p>
                <p className="text-sm text-gray-400">Интеграция с Chart.js или аналогичной библиотекой</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Рекомендации */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Рекомендации по улучшению</CardTitle>
            <CardDescription>
              Советы для повышения качества распознавания
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Улучшите качество изображений</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Используйте изображения с разрешением не менее 300 DPI для лучшего распознавания
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Проверьте результаты верификации</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Регулярно проверяйте и корректируйте распознанный текст для повышения точности
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Оптимизируйте предобработку</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Настройте параметры предобработки для конкретных типов документов
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsPage;
