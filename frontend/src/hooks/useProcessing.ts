import { useProcessing as useProcessingContext } from '../contexts/ProcessingContext';
import { useNavigation } from './useNavigation';
import { useCallback } from 'react';

export const useProcessing = () => {
  const processingContext = useProcessingContext();
  const { markStepCompleted } = useNavigation();

  const processFiles = useCallback(async (files: File[]) => {
    // Добавляем файлы
    processingContext.addFiles(files);
    
    // Помечаем шаг загрузки как завершенный
    markStepCompleted('upload');
    
    // Симуляция обработки
    files.forEach((file, index) => {
      setTimeout(() => {
        processingContext.updateFileStatus(file.name, 'processing');
        
        setTimeout(() => {
          processingContext.updateFileStatus(file.name, 'completed');
          processingContext.updateFileText(file.name, `Пример распознанного текста из документа "${file.name}":\n\nДОКУМЕНТ № ${Math.floor(Math.random() * 10000)}\nДата: ${new Date().toLocaleDateString('ru-RU')}\n\nЗАЯВЛЕНИЕ\n\nЯ, ${['Иванов И.И.', 'Петров П.П.', 'Сидоров С.С.'][Math.floor(Math.random() * 3)]}, прошу рассмотреть мой вопрос о предоставлении архивной справки.\n\nОснование: личное обращение гражданина.\n\nДокументы прилагаются:\n- Копия паспорта\n- Заявление\n- Дополнительные документы\n\nПодпись: _________________ Дата: ${new Date().toLocaleDateString('ru-RU')}\n\nПримечание: Документ содержит как печатный, так и рукописный текст. Распознавание выполнено с точностью 95%.`);
        }, 2000);
      }, index * 1000);
    });
  }, [processingContext, markStepCompleted]);

  return {
    ...processingContext,
    processFiles,
  };
};
