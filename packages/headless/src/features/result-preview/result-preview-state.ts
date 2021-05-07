export interface ResultPreviewState {
  uniqueId: string;
  content: string;
  isLoading: boolean;
  maximumFileSize: number;
}

export function getResultPreviewInitialState(): ResultPreviewState {
  return {
    uniqueId: '',
    content: '',
    isLoading: false,
    maximumFileSize: 50,
  };
}
