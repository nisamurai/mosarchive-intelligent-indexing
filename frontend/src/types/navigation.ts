// Типы для навигации и этапов обработки
export type ProcessingStep = 
  | 'upload' 
  | 'preprocess' 
  | 'ocr' 
  | 'verify' 
  | 'report' 
  | 'statistics';

export interface StepInfo {
  id: ProcessingStep;
  title: string;
  description: string;
  path: string;
  isCompleted: boolean;
  isActive: boolean;
  isAccessible: boolean;
}

export interface NavigationState {
  currentStep: ProcessingStep;
  completedSteps: ProcessingStep[];
  steps: StepInfo[];
}

export interface NavigationContextType {
  navigationState: NavigationState;
  goToStep: (step: ProcessingStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  markStepCompleted: (step: ProcessingStep) => void;
  canGoToStep: (step: ProcessingStep) => boolean;
}
