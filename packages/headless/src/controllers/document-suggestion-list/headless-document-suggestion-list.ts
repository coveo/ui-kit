import {CaseAssistAPIErrorStatusResponse} from '../../api/service/case-assist/case-assist-api-client.js';
import {DocumentSuggestionResponse} from '../../api/service/case-assist/get-document-suggestions/get-document-suggestions-response.js';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine.js';
import {configuration} from '../../app/common-reducers.js';
import {caseAssistConfigurationReducer as caseAssistConfiguration} from '../../features/case-assist-configuration/case-assist-configuration-slice.js';
import {caseFieldReducer as caseField} from '../../features/case-field/case-field-slice.js';
import {caseInputReducer as caseInput} from '../../features/case-input/case-input-slice.js';
import {fetchDocumentSuggestions} from '../../features/document-suggestion/document-suggestion-actions.js';
import {documentSuggestionReducer as documentSuggestion} from '../../features/document-suggestion/document-suggestion-slice.js';
import {
  ConfigurationSection,
  CaseAssistConfigurationSection,
  CaseInputSection,
  DocumentSuggestionSection,
  CaseFieldSection,
} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {
  buildController,
  Controller,
} from '../controller/headless-controller.js';

/**
 * The `DocumentSuggestion` controller is responsible for getting document suggestions using case information present in the state.
 */
export interface DocumentSuggestionList extends Controller {
  /**
   * Fetches document suggestions using case information present in the state.
   */
  fetch(): void;
  /**
   * A scoped and simplified part of the headless state that is relevant to the `DocumentSuggestion` controller.
   */
  state: DocumentSuggestionListState;
}

export interface DocumentSuggestionListState {
  /**
   * Whether document suggestions are being retrieved.
   */
  loading: boolean;
  /**
   * The Case Assist API error response.
   */
  error: CaseAssistAPIErrorStatusResponse | null;
  /**
   * The retrieved document suggestions.
   */
  documents: DocumentSuggestionResponse[];
}

/**
 * Creates a `Document Suggestion List` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `DocumentSuggestionList` controller instance.
 */
export function buildDocumentSuggestionList(
  engine: CaseAssistEngine
): DocumentSuggestionList {
  if (!loadDocumentSuggestionListReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  return {
    ...controller,

    fetch() {
      dispatch(fetchDocumentSuggestions());
    },

    get state() {
      const state = getState().documentSuggestion;
      return {
        loading: state.status.loading,
        error: state.status.error,
        documents: state.documents,
      };
    },
  };
}

function loadDocumentSuggestionListReducers(
  engine: CaseAssistEngine
): engine is CaseAssistEngine<
  ConfigurationSection &
    CaseAssistConfigurationSection &
    CaseInputSection &
    CaseFieldSection &
    DocumentSuggestionSection
> {
  engine.addReducers({
    configuration,
    caseAssistConfiguration,
    caseInput,
    caseField,
    documentSuggestion,
  });
  return true;
}
