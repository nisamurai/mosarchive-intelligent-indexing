import { useState, useEffect } from 'react';

interface Placeholders {
  report: Record<string, string>;
  statistics: Record<string, any>;
  text: Record<string, string>;
  processing_status: Record<string, string>;
  report_descriptions: Record<string, string>;
}

interface MockStatistics {
  processed_count: number;
  avg_confidence: number;
  low_confidence_count: number;
  total_elements: number;
  high_confidence_count: number;
  medium_confidence_count: number;
  processing_time_avg: number;
  last_updated: string;
}

interface DailyStats {
  date: string;
  processed_count: number;
  avg_confidence: number;
  low_confidence_count: number;
}

interface ReportSampleData {
  fileName: string;
  archiveCode: string;
  recognizedText: string;
  archiveId: string;
  fund: string;
  opis: string;
  delo: string;
  fio: string;
  date: string;
  documentNumber: string;
  address: string;
  organization: string;
  processingDate: string;
  fileSize: string;
  status: string;
}

export const usePlaceholders = () => {
  const [placeholders, setPlaceholders] = useState<Placeholders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загружаем все заглушки при инициализации
  useEffect(() => {
    const fetchPlaceholders = async () => {
      try {
        setLoading(true);
        console.log('Загружаем заглушки с /api/placeholders/all...');
        const response = await fetch('http://localhost:8000/api/placeholders/all');
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Заглушки загружены успешно:', data);
        setPlaceholders(data);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки заглушек:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        
        // Fallback заглушки для оффлайн режима
        setPlaceholders({
          report: {
            fileName: "document.pdf",
            archiveCode: "01-0203-0745-000002",
            recognizedText: "Recognized text from document...",
            archiveId: "1",
            fund: "203",
            opis: "745",
            delo: "2",
            fio: "Ivanov I.I.",
            date: "15.03.2024",
            documentNumber: "12345",
            address: "Moscow, Example Street, 1",
            organization: "Archive Institution",
            fileSize: "2.5 MB",
            status: "Processed",
            default: "Sample data"
          },
          statistics: {},
          text: {
            edit_placeholder: "Enter text for editing...",
            ocr_placeholder: "Text will be available after OCR processing...",
            login_placeholder: "Enter login",
            password_placeholder: "Enter password",
            email_placeholder: "Enter email",
            confirm_password_placeholder: "Confirm password",
            general_text_placeholder: "Enter text..."
          },
          processing_status: {
            completed: "Uploaded",
            processing: "Processing",
            error: "Error",
            pending: "Ожидает предобработки"
          },
          report_descriptions: {}
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceholders();
  }, []);

  // Получить заглушку для отчёта
  const getReportPlaceholder = (key: string): string => {
    return placeholders?.report[key] || placeholders?.report.default || 'Пример данных';
  };

  // Получить текстовую заглушку
  const getTextPlaceholder = (key: string): string => {
    return placeholders?.text[key] || 'Введите текст...';
  };

  // Получить статус обработки
  const getProcessingStatus = (status: string): string => {
    return placeholders?.processing_status[status] || status;
  };

  // Получить описание поля отчёта
  const getReportFieldDescription = (key: string): string => {
    return placeholders?.report_descriptions[key] || '';
  };

  // Получить мок-статистику
  const getMockStatistics = async (): Promise<MockStatistics | null> => {
    try {
      const response = await fetch('http://localhost:8000/api/placeholders/statistics/mock');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Ошибка загрузки мок-статистики:', err);
      // Fallback мок-статистика
      return {
        processed_count: 25,
        avg_confidence: 0.85,
        low_confidence_count: 3,
        total_elements: 150,
        high_confidence_count: 120,
        medium_confidence_count: 30,
        processing_time_avg: 25.5,
        last_updated: new Date().toISOString()
      };
    }
  };

  // Получить ежедневную статистику
  const getMockDailyStatistics = async (): Promise<DailyStats[]> => {
    try {
      const response = await fetch('http://localhost:8000/api/placeholders/statistics/daily');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Ошибка загрузки ежедневной статистики:', err);
      // Fallback ежедневная статистика
      const days: DailyStats[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        days.push({
          date: date.toISOString().split('T')[0],
          processed_count: Math.floor(Math.random() * 15) + 5,
          avg_confidence: Math.random() * 0.2 + 0.8,
          low_confidence_count: Math.floor(Math.random() * 5) + 1
        });
      }
      
      return days;
    }
  };

  // Получить пример данных для отчёта
  const getReportSampleData = async (): Promise<ReportSampleData | null> => {
    try {
      const response = await fetch('http://localhost:8000/api/placeholders/report/sample');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Ошибка загрузки примера данных отчёта:', err);
      // Fallback пример данных
      return {
        fileName: "document.pdf",
        archiveCode: "01-0203-0745-000002",
        recognizedText: "Recognized text from document...",
        archiveId: "1",
        fund: "203",
        opis: "745",
        delo: "2",
        fio: "Ivanov I.I.",
        date: "15.03.2024",
        documentNumber: "12345",
        address: "Moscow, Example Street, 1",
        organization: "Archive Institution",
        processingDate: new Date().toLocaleString('en-US'),
        fileSize: "2.5 MB",
        status: "Processed"
      };
    }
  };

  return {
    placeholders,
    loading,
    error,
    getReportPlaceholder,
    getTextPlaceholder,
    getProcessingStatus,
    getReportFieldDescription,
    getMockStatistics,
    getMockDailyStatistics,
    getReportSampleData
  };
};
