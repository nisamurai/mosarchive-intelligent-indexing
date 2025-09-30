import React from 'react';
import { Progress } from '../ui/progress';
import { useProcessing } from '../../contexts/ProcessingContext';

interface ProgressBarProps {
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ className }) => {
  const { progress } = useProcessing();

  if (progress.totalFiles === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {progress.currentStep}
        </span>
        <span className="text-sm text-gray-500">
          {progress.processedFiles} из {progress.totalFiles}
        </span>
      </div>
      <Progress value={progress.progress} className="h-2" />
      {progress.errors.length > 0 && (
        <div className="mt-2">
          {progress.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
