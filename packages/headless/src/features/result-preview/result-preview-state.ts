export interface ResultPreviewState {
  uniqueId: string;
  content: string;
  isLoading: boolean;
  srcPath?: string;
}

export function getResultPreviewInitialState(): ResultPreviewState {
  return {
    uniqueId: '',
    content: '',
    isLoading: false,
  };
}
