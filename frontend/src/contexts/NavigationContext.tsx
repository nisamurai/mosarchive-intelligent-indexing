import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProcessingStep, StepInfo, NavigationState, NavigationContextType } from '../types/navigation';

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

const initialSteps: StepInfo[] = [
  {
    id: 'upload',
    title: 'Загрузка',
    description: 'Загрузка документов',
    path: '/upload',
    isCompleted: false,
    isActive: true,
    isAccessible: true,
  },
  {
    id: 'preprocess',
    title: 'Предобработка',
    description: 'Обработка изображений',
    path: '/preprocess',
    isCompleted: false,
    isActive: false,
    isAccessible: false,
  },
  {
    id: 'ocr',
    title: 'OCR',
    description: 'Распознавание текста',
    path: '/ocr',
    isCompleted: false,
    isActive: false,
    isAccessible: false,
  },
  {
    id: 'verify',
    title: 'Верификация',
    description: 'Проверка результатов',
    path: '/verify',
    isCompleted: false,
    isActive: false,
    isAccessible: false,
  },
  {
    id: 'report',
    title: 'Отчёт',
    description: 'Генерация отчёта',
    path: '/report',
    isCompleted: false,
    isActive: false,
    isAccessible: false,
  },
  {
    id: 'statistics',
    title: 'Статистика',
    description: 'Анализ результатов',
    path: '/statistics',
    isCompleted: false,
    isActive: false,
    isAccessible: true,
  },
];

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentStep: 'upload',
    completedSteps: [],
    steps: initialSteps,
  });


  const goToStep = (step: ProcessingStep) => {
    if (!canGoToStep(step)) return;

    setNavigationState(prev => ({
      ...prev,
      currentStep: step,
      steps: prev.steps.map(s => ({
        ...s,
        isActive: s.id === step,
      })),
    }));
  };

  const goToNextStep = () => {
    const currentIndex = navigationState.steps.findIndex(s => s.id === navigationState.currentStep);
    if (currentIndex < navigationState.steps.length - 1) {
      const nextStep = navigationState.steps[currentIndex + 1];
      if (nextStep.isAccessible) {
        goToStep(nextStep.id);
      }
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = navigationState.steps.findIndex(s => s.id === navigationState.currentStep);
    if (currentIndex > 0) {
      const prevStep = navigationState.steps[currentIndex - 1];
      goToStep(prevStep.id);
    }
  };

  const markStepCompleted = (step: ProcessingStep) => {
    setNavigationState(prev => {
      const newCompletedSteps = [...prev.completedSteps];
      if (!newCompletedSteps.includes(step)) {
        newCompletedSteps.push(step);
      }

      // Обновляем доступность следующих шагов
      const updatedSteps = prev.steps.map(s => {
        if (s.id === step) {
          return { ...s, isCompleted: true };
        }
        
        // Делаем следующий шаг доступным после завершения текущего
        const currentStepIndex = prev.steps.findIndex(s2 => s2.id === step);
        const nextStepIndex = currentStepIndex + 1;
        if (s.id === prev.steps[nextStepIndex]?.id) {
          return { ...s, isAccessible: true };
        }
        
        return s;
      });

      return {
        ...prev,
        completedSteps: newCompletedSteps,
        steps: updatedSteps,
      };
    });
  };

  const canGoToStep = (step: ProcessingStep): boolean => {
    // Статистика всегда доступна
    if (step === 'statistics') {
      return true;
    }
    
    const stepInfo = navigationState.steps.find(s => s.id === step);
    return stepInfo?.isAccessible || false;
  };

  const value: NavigationContextType = {
    navigationState,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    markStepCompleted,
    canGoToStep,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
