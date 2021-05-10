export interface ResultPreviewState {
  uniqueId: string;
  content: string;
  isLoading: boolean;
  maximumPreviewSize: number;
}

export function getResultPreviewInitialState(): ResultPreviewState {
  return {
    uniqueId: '',
    content: '',
    isLoading: false,
    maximumPreviewSize: 0,
  };
}
