import * as React from "react"
import { cn } from "../../lib/utils"
import { Check, ChevronRight } from "lucide-react"
import { ProcessingStep } from "../../types/navigation"

interface StepperProps {
  currentStep: ProcessingStep;
  completedSteps: ProcessingStep[];
  steps: Array<{
    id: ProcessingStep;
    title: string;
    description: string;
  }>;
  className?: string;
}

const Stepper: React.FC<StepperProps> = ({
  currentStep,
  completedSteps,
  steps,
  className
}) => {
  const getStepStatus = (stepId: ProcessingStep) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const getStepIndex = (stepId: ProcessingStep) => {
    return steps.findIndex(step => step.id === stepId);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isLast = index === steps.length - 1;
          
          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    {
                      "bg-green-500 border-green-500 text-white": status === 'completed',
                      "bg-blue-500 border-blue-500 text-white": status === 'active',
                      "bg-gray-100 border-gray-300 text-gray-500": status === 'pending',
                    }
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={cn(
                    "text-sm font-medium",
                    {
                      "text-green-600": status === 'completed',
                      "text-blue-600": status === 'active',
                      "text-gray-500": status === 'pending',
                    }
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 mx-4">
                  <div className={cn(
                    "h-0.5 w-full",
                    {
                      "bg-green-500": getStepIndex(steps[index + 1].id) <= completedSteps.length,
                      "bg-gray-300": getStepIndex(steps[index + 1].id) > completedSteps.length,
                    }
                  )} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export { Stepper };
