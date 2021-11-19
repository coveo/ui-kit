import {CaseAssistAPIErrorStatusResponse} from '../../api/service/case-assist/case-assist-api-client';

export const getCaseFieldsInitialState = (): CaseFieldsState => ({
  enabled: false,
  status: {
    loading: false,
    error: {
      statusCode: 0,
      message: '',
      type: '',
    },
    lastResponseId: '',
  },
  fields: {},
});

export interface CaseFieldsStatus {
  /**
   * `true` if a request is in progress and `false` otherwise.
   */
  loading: boolean;
  /**
   * The Case Assist API error response.
   */
  error: CaseAssistAPIErrorStatusResponse;
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

export interface CaseField {
  /**
   * The field to predict.
   */
  value: string;
  /**
   * The field value suggestions returned from the Coveo Customer Service API.
   */
  suggestions: CaseFieldSuggestion[];
}

export interface CaseFieldsState {
  /**
   * Specifies if the automatic update of case field classifications should be enabled. By default the feature is disabled.
   */
  enabled: boolean;
  /**
   * The status of the case fields classification request.
   */
  status: CaseFieldsStatus;
  /**
   * The case fields for which classifications are retrieved.
   */
  fields: {
    [fieldName: string]: CaseField;
  };
}
