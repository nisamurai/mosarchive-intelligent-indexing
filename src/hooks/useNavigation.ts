import { useNavigation as useNavigationContext } from '../contexts/NavigationContext';
import { useNavigate } from 'react-router-dom';
import { ProcessingStep } from '../types/navigation';
import { ROUTES } from '../lib/constants';

export const useNavigation = () => {
  const navigationContext = useNavigationContext();
  const navigate = useNavigate();

  const goToStep = (step: ProcessingStep) => {
    navigationContext.goToStep(step);
    
    // Навигация по URL
    const route = ROUTES[step];
    if (route) {
      navigate(route);
    }
  };

  const goToNextStep = () => {
    navigationContext.goToNextStep();
    
    // Навигация к следующему шагу
    const currentIndex = navigationContext.navigationState.steps.findIndex(
      step => step.id === navigationContext.navigationState.currentStep
    );
    
    if (currentIndex < navigationContext.navigationState.steps.length - 1) {
      const nextStep = navigationContext.navigationState.steps[currentIndex + 1];
      const route = ROUTES[nextStep.id as ProcessingStep];
      if (route) {
        navigate(route);
      }
    }
  };

  const goToPreviousStep = () => {
    navigationContext.goToPreviousStep();
    
    // Навигация к предыдущему шагу
    const currentIndex = navigationContext.navigationState.steps.findIndex(
      step => step.id === navigationContext.navigationState.currentStep
    );
    
    if (currentIndex > 0) {
      const prevStep = navigationContext.navigationState.steps[currentIndex - 1];
      const route = ROUTES[prevStep.id as ProcessingStep];
      if (route) {
        navigate(route);
      }
    }
  };

  return {
    ...navigationContext,
    goToStep,
    goToNextStep,
    goToPreviousStep,
  };
};
