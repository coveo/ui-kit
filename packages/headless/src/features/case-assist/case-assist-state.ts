import {Result} from '../../api/service/service-api-client';

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

export interface DocumentSuggestionsState {
  documents: Result[];
  totalCount: number;
  responseId: string;
  loading: boolean;
  error: any;
}

export interface CaseAssistState {
  caseAssistId: string;
  caseInformation: Record<string, string>;
  userContext: Record<string, string>;
  debug: boolean;
  classifications: ClassificationsState;
  documentSuggestions: DocumentSuggestionsState;
}

export function getCaseAssistInitialState(): CaseAssistState {
  return {
    caseAssistId: '',
    caseInformation: {},
    userContext: {},
    debug: false,

    classifications: {
      fields: [],
      responseId: '',
      loading: false,
      error: null,
    },

    documentSuggestions: {
      documents: [],
      totalCount: 0,
      responseId: '',
      loading: false,
      error: null,
    },
  };
}
