import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, TrendingUp, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { usePlaceholders } from '../hooks/usePlaceholders';

// Интерфейс для статистики обработки
interface ProcessingStatistics {
  processed_count: number;
  avg_confidence: number;
  low_confidence_count: number;
  total_elements: number;
  high_confidence_count: number;
  medium_confidence_count: number;
  processing_time_avg: number; // в секундах
  last_updated: Date;
}

// Интерфейс для динамики по дням
interface DailyStats {
  date: string;
  processed_count: number;
  avg_confidence: number;
  low_confidence_count: number;
}

// Пропсы компонента
interface StatisticsComponentProps {
  className?: string;
  showChart?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // в миллисекундах
}

// Функция для генерации заглушечных данных статистики (fallback)
const generateMockStatistics = (): ProcessingStatistics => {
  return {
    processed_count: Math.floor(Math.random() * 50) + 10, // 10-60 документов
    avg_confidence: Math.random() * 0.3 + 0.7, // 70-100% уверенность
    low_confidence_count: Math.floor(Math.random() * 8) + 1, // 1-9 элементов с низкой уверенностью
    total_elements: Math.floor(Math.random() * 200) + 100, // 100-300 элементов
    high_confidence_count: Math.floor(Math.random() * 150) + 80, // 80-230 элементов с высокой уверенностью
    medium_confidence_count: Math.floor(Math.random() * 50) + 20, // 20-70 элементов со средней уверенностью
    processing_time_avg: Math.random() * 30 + 10, // 10-40 секунд среднее время обработки
    last_updated: new Date()
  };
};

// Функция для генерации данных динамики за последние 7 дней (fallback)
const generateMockDailyStats = (): DailyStats[] => {
  const days: DailyStats[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    days.push({
      date: date.toISOString().split('T')[0],
      processed_count: Math.floor(Math.random() * 15) + 5, // 5-20 документов в день
      avg_confidence: Math.random() * 0.2 + 0.8, // 80-100% уверенность
      low_confidence_count: Math.floor(Math.random() * 5) + 1 // 1-6 элементов с низкой уверенностью
    });
  }
  
  return days;
};

// Компонент карточки статистики
const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}> = ({ title, value, subtitle, icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp 
                className={`w-4 h-4 mr-1 ${
                  trend.isPositive ? 'text-green-500' : 'text-red-500'
                }`} 
              />
              <span className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Компонент простой диаграммы
const SimpleChart: React.FC<{
  data: DailyStats[];
  className?: string;
}> = ({ data, className }) => {
  const maxCount = Math.max(...data.map(d => d.processed_count));
  const maxConfidence = Math.max(...data.map(d => d.avg_confidence));

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Динамика за последние 7 дней
      </h3>
      
      <div className="space-y-4">
        {/* График количества обработанных документов */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Обработано документов
          </h4>
          <div className="flex items-end space-x-2 h-20">
            {data.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                  style={{
                    height: `${(day.processed_count / maxCount) * 100}%`,
                    minHeight: '4px'
                  }}
                  title={`${day.date}: ${day.processed_count} документов`}
                />
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(day.date).toLocaleDateString('ru-RU', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* График средней уверенности */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Средняя уверенность
          </h4>
          <div className="flex items-end space-x-2 h-20">
            {data.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    day.avg_confidence >= 0.9 ? 'bg-green-500 hover:bg-green-600' :
                    day.avg_confidence >= 0.8 ? 'bg-yellow-500 hover:bg-yellow-600' :
                    'bg-red-500 hover:bg-red-600'
                  }`}
                  style={{
                    height: `${(day.avg_confidence / maxConfidence) * 100}%`,
                    minHeight: '4px'
                  }}
                  title={`${day.date}: ${Math.round(day.avg_confidence * 100)}%`}
                />
                <span className="text-xs text-gray-500 mt-1">
                  {Math.round(day.avg_confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Основной компонент статистики
export const StatisticsComponent: React.FC<StatisticsComponentProps> = ({
  className,
  showChart = true,
  autoRefresh = false,
  refreshInterval = 30000 // 30 секунд по умолчанию
}) => {
  const [statistics, setStatistics] = useState<ProcessingStatistics>(generateMockStatistics());
  const [dailyStats, setDailyStats] = useState<DailyStats[]>(generateMockDailyStats());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { getMockStatistics, getMockDailyStatistics } = usePlaceholders();

  // Функция обновления статистики
  const refreshStatistics = async () => {
    setIsRefreshing(true);
    
    try {
      // Пытаемся получить данные с бэкенда
      const [mockStats, mockDailyStats] = await Promise.all([
        getMockStatistics(),
        getMockDailyStatistics()
      ]);
      
      if (mockStats) {
        setStatistics({
          ...mockStats,
          last_updated: new Date(mockStats.last_updated)
        });
      }
      
      if (mockDailyStats) {
        setDailyStats(mockDailyStats);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики с бэкенда, используем fallback:', error);
      // Fallback к локальным заглушкам
      setStatistics(generateMockStatistics());
      setDailyStats(generateMockDailyStats());
    }
    
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  // Автообновление статистики
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshStatistics, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Вычисляем дополнительные метрики
  const highConfidencePercentage = Math.round((statistics.high_confidence_count / statistics.total_elements) * 100);
  const lowConfidencePercentage = Math.round((statistics.low_confidence_count / statistics.total_elements) * 100);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок с кнопкой обновления */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Статистика обработки документов
          </h2>
          <p className="text-gray-600 mt-1">
            Обзор результатов автоматического распознавания и индексирования
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Обновлено: {lastRefresh.toLocaleTimeString('ru-RU')}</span>
            </div>
          </div>
          
          <button
            onClick={refreshStatistics}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Обновление...' : 'Обновить'}</span>
          </button>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Обработано документов"
          value={statistics.processed_count}
          subtitle="Всего за период"
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        
        <StatCard
          title="Средняя уверенность"
          value={`${Math.round(statistics.avg_confidence * 100)}%`}
          subtitle={`${highConfidencePercentage}% высокого качества`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          trend={{ value: 5, isPositive: true }}
        />
        
        <StatCard
          title="Низкая уверенность"
          value={statistics.low_confidence_count}
          subtitle={`${lowConfidencePercentage}% от общего числа`}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="yellow"
          trend={{ value: -8, isPositive: true }}
        />
        
        <StatCard
          title="Среднее время обработки"
          value={`${Math.round(statistics.processing_time_avg)}с`}
          subtitle="На один документ"
          icon={<BarChart3 className="w-6 h-6" />}
          color="purple"
          trend={{ value: -15, isPositive: true }}
        />
      </div>

      {/* Детальная статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Распределение по уровням уверенности */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Распределение по уровням уверенности
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Высокая уверенность (≥90%)</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {statistics.high_confidence_count} ({highConfidencePercentage}%)
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${highConfidencePercentage}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Средняя уверенность (70-89%)</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {statistics.medium_confidence_count} ({Math.round((statistics.medium_confidence_count / statistics.total_elements) * 100)}%)
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((statistics.medium_confidence_count / statistics.total_elements) * 100)}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Низкая уверенность (&lt;70&#37;)</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {statistics.low_confidence_count} ({lowConfidencePercentage}%)
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${lowConfidencePercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Информация о системе */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Информация о системе
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Всего элементов</span>
              <span className="text-sm font-medium text-gray-900">{statistics.total_elements}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Последнее обновление</span>
              <span className="text-sm font-medium text-gray-900">
                {statistics.last_updated.toLocaleString('ru-RU')}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Автообновление</span>
              <span className={`text-sm font-medium ${autoRefresh ? 'text-green-600' : 'text-gray-500'}`}>
                {autoRefresh ? 'Включено' : 'Выключено'}
              </span>
            </div>
            
            {autoRefresh && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Интервал обновления</span>
                <span className="text-sm font-medium text-gray-900">
                  {refreshInterval / 1000}с
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Рекомендации */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Рекомендации
          </h3>
          
          <div className="space-y-3">
            {lowConfidencePercentage > 10 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Высокий процент низкой уверенности
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Рекомендуется проверить качество исходных изображений
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {statistics.avg_confidence >= 0.9 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Отличное качество распознавания
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Система работает стабильно
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {statistics.processing_time_avg > 30 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Длительное время обработки
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Рассмотрите возможность оптимизации
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* График динамики */}
      {showChart && (
        <SimpleChart data={dailyStats} />
      )}

      {/* Ссылка на документацию */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsComponent;
