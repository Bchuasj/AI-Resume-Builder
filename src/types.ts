export interface OptimizationRequest {
  resumeData: string; // Base64 string
  resumeMimeType: string;
  jobDescription: string;
}

export interface AnalysisItem {
  change: string;
  reason: string;
  quote?: string; // The exact text snippet in the new resume to highlight
}

export interface OptimizationAnalysis {
  summary: string;
  changes: AnalysisItem[];
  keywords: string[];
  jobUrl?: string;
  coverLetter?: string;
  coverEmail?: string;
}

export interface OptimizationResult {
  markdown: string;
  analysis: OptimizationAnalysis;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface JobInput {
  id: string;
  text: string;
}

export interface JobResult {
  jobId: string;
  status: AppStatus;
  result: OptimizationResult | null;
  error: string | null;
}

export interface UploadedFile {
  name: string;
  type: string;
  data: string; // Base64
}