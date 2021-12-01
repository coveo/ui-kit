import {fetchDocumentSuggestions} from '../../features/document-suggestion/document-suggestion-actions';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {
  ConfigurationSection,
  CaseAssistConfigurationSection,
  CaseInputSection,
  DocumentSuggestionSection,
  CaseFieldSection,
} from '../../state/state-sections';
import {buildController, Controller} from '../controller/headless-controller';
import {
  caseAssistConfiguration,
  configuration,
  caseInput,
  caseField,
  documentSuggestion,
} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {CaseAssistAPIErrorStatusResponse} from '../../api/service/case-assist/case-assist-api-client';
import {DocumentSuggestion as Document} from '../../api/service/case-assist/get-document-suggestions/get-document-suggestions-response';

/**
 * The `DocumentSuggestion` controller is responsible for getting document suggestions using case information present in the state.
 */
export interface DocumentSuggestion extends Controller {
  /**
   * Fetches document suggestions using case information present in the state.
   */
  fetch(): void;
  /**
   * A scoped and simplified part of the headless state that is relevant to the `DocumentSuggestion` controller.
   */
  state: DocumentSuggestionState;
}

export interface DocumentSuggestionState {
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
  documents: Document[];
}

/**
 * Creates a `Document Suggestion` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `DocumentSuggestion` controller instance.
 */
export function buildDocumentSuggestion(
  engine: CaseAssistEngine
): DocumentSuggestion {
  if (!loadDocumentSuggestionReducers(engine)) {
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

function loadDocumentSuggestionReducers(
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
