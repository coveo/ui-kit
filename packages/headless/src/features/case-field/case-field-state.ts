import type {CaseAssistAPIErrorStatusResponse} from '../../api/service/case-assist/case-assist-api-client.js';

export const getCaseFieldInitialState = (): CaseFieldState => ({
  status: {
    loading: false,
    error: null,
    lastResponseId: '',
  },
  fields: {},
});

interface CaseFieldStatus {
  /**
   * `true` if a request is in progress and `false` otherwise.
   */
  loading: boolean;
  /**
   * The Case Assist API error response.
   */
  error: CaseAssistAPIErrorStatusResponse | null;
  /**
   * The ID of the response.
   */
  lastResponseId: string;
}

export interface CaseFieldSuggestion {
  /**
   * The ID of the suggestion.
   */
  id: string;
  /**
   * The suggested field value.
   */
  value: string;
  /**
   * The confidence value of the suggestion in decimal.
   */
  confidence: number;
}

interface CaseField {
  /**
   * The field to predict.
   */
  value: string;
  /**
   * The field value suggestions returned from the Coveo Customer Service API.
   */
  suggestions: CaseFieldSuggestion[];
}

export interface CaseFieldState {
  /**
   * The status of the case fields classification request.
   */
  status: CaseFieldStatus;
  /**
   * The case fields for which classifications are retrieved.
   */
  fields: {
    [fieldName: string]: CaseField;
  };
}
