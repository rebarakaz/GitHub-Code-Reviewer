export type LoadingState = 'idle' | 'fetching_repo' | 'reviewing_code' | 'success' | 'error';

export interface RepoFile {
  path: string;
}

export interface RepoFileWithContent {
  path: string;
  content: string;
}

export enum FeedbackSeverity {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Info = 'Info',
}

export interface FeedbackItem {
  line: number;
  suggestion: string;
  severity: FeedbackSeverity;
}

export interface FileReview {
  filePath: string;
  feedback: FeedbackItem[];
  error?: string;
  summary?: string;
}