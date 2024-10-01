import {CaseAssistAPIClient} from '../../api/service/case-assist/case-assist-api-client.js';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine.js';
import {CoreEngine} from '../../app/engine.js';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {logQuickviewDocumentSuggestionClick} from '../../features/case-assist/case-assist-analytics-actions.js';
import {documentSuggestionReducer as documentSuggestion} from '../../features/document-suggestion/document-suggestion-slice.js';
import {preparePreviewPagination} from '../../features/result-preview/result-preview-actions.js';
import {buildResultPreviewRequest} from '../../features/result-preview/result-preview-request-builder.js';
import {DocumentSuggestionSection} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {
  buildCoreQuickview,
  QuickviewOptions,
  QuickviewState,
  QuickviewProps,
  Quickview,
} from '../core/quickview/headless-core-quickview.js';

export interface CaseAssistQuickviewProps extends QuickviewProps {}

export interface CaseAssistQuickviewOptions extends QuickviewOptions {}

export interface CaseAssistQuickview extends Quickview {
  state: CaseAssistQuickviewState;
}

export interface CaseAssistQuickviewState extends QuickviewState {
  /**
   * The number of available document for the current document set.
   *
   * Can be used for quickview pagination purpose.
   */
  totalDocuments: number;
  /**
   * The position of the document in the current document set.
   *
   * Can be used for quickview pagination purpose.
   */
  currentDocument: number;
}

/**
 * Creates a `CaseAssistQuickview` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `CaseAssistQuickview` properties.
 * @returns A `CaseAssistQuickview` controller instance.
 */
export function buildCaseAssistQuickview(
  engine: CaseAssistEngine,
  props: CaseAssistQuickviewProps
): CaseAssistQuickview {
  if (!loadSearchQuickviewReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const getState = () => engine.state;
  const getDocuments = () => getState().documentSuggestion.documents;

  const fetchResultContentCallback = () => {
    engine.dispatch(
      logQuickviewDocumentSuggestionClick(props.options.result.uniqueId)
    );
  };
  const path = '/html';

  const core = buildCoreQuickview(
    engine,
    props,
    buildResultPreviewRequest,
    path,
    fetchResultContentCallback
  );

  dispatch(
    preparePreviewPagination({
      results: getDocuments(),
    })
  );

  return {
    ...core,
    get state() {
      return {
        ...core.state,
        currentDocument:
          getDocuments().findIndex(
            (r) => r.uniqueId === core.state.currentResultUniqueId
          ) + 1,
        totalDocuments: getDocuments().length,
      };
    },
  };
}

function loadSearchQuickviewReducers(
  engine: CoreEngine
): engine is CoreEngine<
  DocumentSuggestionSection,
  ClientThunkExtraArguments<CaseAssistAPIClient>
> {
  engine.addReducers({documentSuggestion});
  return true;
}
