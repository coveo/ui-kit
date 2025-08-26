import type {CaseAssistAPIErrorStatusResponse} from '../../api/service/case-assist/case-assist-api-client.js';
import type {DocumentSuggestionResponse} from '../../api/service/case-assist/get-document-suggestions/get-document-suggestions-response.js';

export const getDocumentSuggestionInitialState =
  (): DocumentSuggestionState => ({
    status: {
      loading: false,
      error: null,
      lastResponseId: '',
    },
    documents: [],
  });

interface DocumentSuggestionStatus {
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

export interface DocumentSuggestionState {
  /**
   * The status of the document suggestions request.
   */
  status: DocumentSuggestionStatus;
  /**
   * The retrieved document suggestions.
   */
  documents: DocumentSuggestionResponse[];
}
