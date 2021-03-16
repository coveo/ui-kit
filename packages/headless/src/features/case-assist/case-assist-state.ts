export interface ClassificationFieldState {
  name: string;
  predictions: ClassificationPredictionState[];
}

export interface ClassificationPredictionState {
  id: string;
  value: string;
  confidence: number;
}

export interface ClassificationsState {
  fields: ClassificationFieldState[];
  responseId: string;

  loading: boolean;
  error: any;
}

export interface CaseAssistState {
  classifications: ClassificationsState;
}

export function getCaseAssistInitialState(): CaseAssistState {
  return {
    classifications: {
      fields: [],
      responseId: '',
      loading: false,
      error: null,
    },
  };
}
