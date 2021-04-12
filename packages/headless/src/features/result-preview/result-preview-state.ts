export interface ResultPreviewState {
  uniqueId: string;
  content: string;
  isLoading: boolean;
}

export function getResultPreviewInitialState(): ResultPreviewState {
  return {
    uniqueId: '',
    content: '',
    isLoading: false,
  };
}
