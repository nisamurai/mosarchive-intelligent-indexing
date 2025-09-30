import React from 'react';
import { Button } from '../ui/button';
import { useNavigation } from '../../contexts/NavigationContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationProps {
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const { 
    navigationState, 
    goToNextStep, 
    goToPreviousStep, 
    canGoToStep 
  } = useNavigation();

  const currentIndex = navigationState.steps.findIndex(
    step => step.id === navigationState.currentStep
  );
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === navigationState.steps.length - 1;
  const nextStep = !isLastStep ? navigationState.steps[currentIndex + 1] : null;
  const canGoNext = nextStep ? canGoToStep(nextStep.id) : false;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Button
        variant="outline"
        onClick={goToPreviousStep}
        disabled={isFirstStep}
        className="flex items-center space-x-2"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Назад</span>
      </Button>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">
          Шаг {currentIndex + 1} из {navigationState.steps.length}
        </span>
      </div>

      <Button
        onClick={goToNextStep}
        disabled={!canGoNext}
        className="flex items-center space-x-2"
      >
        <span>Вперед</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default Navigation;
