export interface GeneratedAnswerState {
  isLoading: boolean;
  retryCount: number;
  answer?: string;
  streamKey?: string;
}

export function getGeneratedAnswerInitialState(): GeneratedAnswerState {
  return {
    isLoading: false,
    retryCount: 0,
  };
}
