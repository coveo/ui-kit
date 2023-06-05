export interface GeneratedAnswerState {
  isLoading: boolean;
  answer?: string;
  error?: {
    message?: string;
    code?: number;
  };
}

export function getGeneratedAnswerInitialState(): GeneratedAnswerState {
  return {
    isLoading: false,
  };
}
