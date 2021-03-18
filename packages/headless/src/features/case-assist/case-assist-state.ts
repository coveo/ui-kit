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
  caseAssistId: string;
  caseInformation: Record<string, string>;
  userContext: Record<string, string>;

  classifications: ClassificationsState;
}

export function getCaseAssistInitialState(): CaseAssistState {
  return {
    caseAssistId: '',
    caseInformation: {},
    userContext: {},

    classifications: {
      fields: [],
      responseId: '',
      loading: false,
      error: null,
    },
  };
}
