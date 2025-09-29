// Типы для обработки документов
export interface ProcessedFile {
  file: File;
  recognizedText?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
  processedAt: Date;
  confidence?: number;
  attributes?: DocumentAttributes;
}

export interface DocumentAttributes {
  names?: string[];
  dates?: string[];
  addresses?: string[];
  organizations?: string[];
  documentNumbers?: string[];
  archiveCodes?: string[];
}

export interface ProcessingProgress {
  currentStep: string;
  progress: number;
  totalFiles: number;
  processedFiles: number;
  errors: string[];
}

export interface ProcessingContextType {
  files: ProcessedFile[];
  progress: ProcessingProgress;
  addFiles: (files: File[]) => void;
  updateFileStatus: (fileId: string, status: ProcessedFile['processingStatus']) => void;
  updateFileText: (fileId: string, text: string) => void;
  clearFiles: () => void;
}
