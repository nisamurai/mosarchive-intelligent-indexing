// Типы для системы отчётов с архивным шифром

export interface ArchiveCode {
  archiveId: string;    // 01 - номер архива
  fund: string;         // 0203 - номер фонда
  signature: string;    // 0745 - номер подписи
  caseNumber: string;   // 000002 - номер дела (6 значный)
  fullCode: string;     // 01-0203-0745-000002 - полный шифр
}

export interface DocumentPageInfo {
  fileName: string;     // Имя файла страницы
  pageNumber: number;   // Номер страницы в деле
  filePath: string;     // Путь к файлу
  imageNumber: string;  // 8-значная нумерация образа
}

export interface RecognizedAttribute {
  type: 'fio' | 'date' | 'address' | 'organization' | 'documentNumber' | 'archiveCode';
  value: string;
  confidence: number;
  position?: {
    start: number;
    end: number;
  };
}

export interface DocumentRecognitionResult {
  archiveCode: ArchiveCode;
  pageInfo: DocumentPageInfo;
  recognitionType: 'full' | 'attribute'; // сквозное или атрибутивное
  fullText?: string; // для сквозного распознавания
  attributes?: RecognizedAttribute[]; // для атрибутивного распознавания
  processingDate: Date;
  confidence: number;
}

export interface ReportField {
  key: string;
  label: string;
  description: string;
  category: 'archive' | 'document' | 'attributes' | 'file' | 'text';
  required?: boolean;
  dependsOn?: string[]; // поля, от которых зависит это поле
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
  recognitionType: 'full' | 'attribute' | 'both';
}

export interface ReportConfiguration {
  template: ReportTemplate;
  selectedFields: string[];
  customFields?: ReportField[];
  outputFormat: 'csv' | 'xlsx' | 'json';
  includePageInfo: boolean;
  groupByArchive: boolean;
}

export interface ReportExportResult {
  fileName: string;
  format: string;
  recordsCount: number;
  fieldsCount: number;
  fileSize: number;
  exportDate: Date;
}
