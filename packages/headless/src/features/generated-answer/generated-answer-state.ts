export interface GeneratedAnswerState {
  isLoading: boolean;
  answer?: string;
  error?: string;
}

export function getGeneratedAnswerInitialState(): GeneratedAnswerState {
  return {
    isLoading: false,
  };
}
