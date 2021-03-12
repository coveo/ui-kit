export interface QuickviewState {
  resultUniqueId: string;
  resultContent: string;
}

export function getQuickviewInitialState(): QuickviewState {
  return {
    resultUniqueId: '',
    resultContent: '',
  };
}
