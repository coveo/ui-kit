export interface ResultPreviewState {
  uniqueId: string;
  content: string;
}

export function getResultPreviewInitialState(): ResultPreviewState {
  return {
    uniqueId: '',
    content: '',
  };
}
