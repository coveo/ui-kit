export interface ResultPreviewState {
  uniqueId: string;
  content: string;
  isLoading: boolean;
  contentURL?: string;
  position: number;
  resultsWithPreview: string[];
}

export function getResultPreviewInitialState(): ResultPreviewState {
  return {
    uniqueId: '',
    content: '',
    isLoading: false,
    position: -1,
    resultsWithPreview: [],
  };
}
