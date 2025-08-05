import type {CaseAssistAPIErrorStatusResponse} from '../../api/service/case-assist/case-assist-api-client.js';
import type {DocumentSuggestionResponse} from '../../api/service/case-assist/get-document-suggestions/get-document-suggestions-response.js';
import type {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine.js';
import {configuration} from '../../app/common-reducers.js';
import {caseAssistConfigurationReducer as caseAssistConfiguration} from '../../features/case-assist-configuration/case-assist-configuration-slice.js';
import {caseFieldReducer as caseField} from '../../features/case-field/case-field-slice.js';
import {caseInputReducer as caseInput} from '../../features/case-input/case-input-slice.js';
import {fetchDocumentSuggestions} from '../../features/document-suggestion/document-suggestion-actions.js';
import {documentSuggestionReducer as documentSuggestion} from '../../features/document-suggestion/document-suggestion-slice.js';
import type {
  CaseAssistConfigurationSection,
  CaseFieldSection,
  CaseInputSection,
  ConfigurationSection,
  DocumentSuggestionSection,
} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../controller/headless-controller.js';

/**
 * The `DocumentSuggestion` controller is responsible for getting document suggestions using case information present in the state.
 *
 * For example implementations, see the following [Coveo Quantic Case Assist components](https://docs.coveo.com/en/quantic/latest/reference/case-assist-components/):
 * * [quanticCaseClassification.js](https://github.com/coveo/ui-kit/blob/main/packages/quantic/force-app/main/default/lwc/quanticCaseClassification/quanticCaseClassification.js)
 * * [quanticDocumentSuggestion](https://github.com/coveo/ui-kit/blob/main/packages/quantic/force-app/main/default/lwc/quanticDocumentSuggestion/quanticDocumentSuggestion.js)
 *
 * @group Controllers
 * @category DocumentSuggestionList
 */
export interface DocumentSuggestionList extends Controller {
  /**
   * Fetches document suggestions using case information present in the state.
   */
  fetch(): void;
  /**
   * A scoped and simplified part of the headless state that is relevant to the `DocumentSuggestionList` controller.
   */
  state: DocumentSuggestionListState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `DocumentSuggestionList` controller.
 *
 * @group Controllers
 * @category DocumentSuggestionList
 */
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
 *
 * @group Controllers
 * @category DocumentSuggestionList
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
