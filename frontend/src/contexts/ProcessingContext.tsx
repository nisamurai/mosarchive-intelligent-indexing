import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProcessedFile, ProcessingProgress, ProcessingContextType } from '../types/processing';

const ProcessingContext = createContext<ProcessingContextType | undefined>(undefined);

interface ProcessingProviderProps {
  children: ReactNode;
}

export const ProcessingProvider: React.FC<ProcessingProviderProps> = ({ children }) => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [progress, setProgress] = useState<ProcessingProgress>({
    currentStep: 'Загрузка файлов',
    progress: 0,
    totalFiles: 0,
    processedFiles: 0,
    errors: [],
  });

  const addFiles = (newFiles: File[]) => {
    const processedFiles: ProcessedFile[] = newFiles.map(file => ({
      file,
      processingStatus: 'pending',
      processedAt: new Date(),
    }));

    setFiles(prev => [...prev, ...processedFiles]);
    setProgress(prev => ({
      ...prev,
      totalFiles: prev.totalFiles + newFiles.length,
    }));
  };

  const updateFileStatus = (fileId: string, status: ProcessedFile['processingStatus']) => {
    setFiles(prev => prev.map(file => 
      file.file.name === fileId 
        ? { ...file, processingStatus: status }
        : file
    ));

    if (status === 'completed') {
      setProgress(prev => ({
        ...prev,
        processedFiles: prev.processedFiles + 1,
        progress: Math.round((prev.processedFiles + 1) / prev.totalFiles * 100),
      }));
    }
  };

  const updateFileText = (fileId: string, text: string) => {
    setFiles(prev => prev.map(file => 
      file.file.name === fileId 
        ? { ...file, recognizedText: text }
        : file
    ));
  };

  const clearFiles = () => {
    setFiles([]);
    setProgress({
      currentStep: 'Загрузка файлов',
      progress: 0,
      totalFiles: 0,
      processedFiles: 0,
      errors: [],
    });
  };

  const value: ProcessingContextType = {
    files,
    progress,
    addFiles,
    updateFileStatus,
    updateFileText,
    clearFiles,
  };

  return (
    <ProcessingContext.Provider value={value}>
      {children}
    </ProcessingContext.Provider>
  );
};

export const useProcessing = (): ProcessingContextType => {
  const context = useContext(ProcessingContext);
  if (context === undefined) {
    throw new Error('useProcessing must be used within a ProcessingProvider');
  }
  return context;
};
