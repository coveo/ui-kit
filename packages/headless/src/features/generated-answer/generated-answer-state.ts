export interface GeneratedAnswerState {
  isLoading: boolean;
  retryCount: number;
  answer?: string;
  streamKey?: string;
  timeout?: NodeJS.Timeout;
}

export function getGeneratedAnswerInitialState(): GeneratedAnswerState {
  return {
    isLoading: false,
    retryCount: 0,
  };
}
