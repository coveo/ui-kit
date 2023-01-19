import {CoreEngine} from '../..';
import {CaseAssistAPIClient} from '../../api/service/case-assist/case-assist-api-client';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {documentSuggestion} from '../../app/reducers';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {logQuickviewDocumentSuggestionClick} from '../../features/case-assist/case-assist-analytics-actions';
import {preparePreviewPagination} from '../../features/result-preview/result-preview-actions';
import {buildResultPreviewRequest} from '../../features/result-preview/result-preview-request-builder';
import {DocumentSuggestionSection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {
  buildCoreQuickview,
  QuickviewOptions,
  QuickviewState,
  QuickviewProps,
  Quickview,
} from '../core/quickview/headless-core-quickview';

export interface CaseAssistQuickviewProps extends QuickviewProps {}

export interface CaseAssistQuickviewOptions extends QuickviewOptions {}

export interface CaseAssistQuickview extends Quickview {}

export interface CaseAssistQuickviewState extends QuickviewState {}

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
  dispatch(
    preparePreviewPagination({
      results: getState().documentSuggestion.documents,
    })
  );

  const fetchResultContentCallback = () => {
    engine.dispatch(
      logQuickviewDocumentSuggestionClick(props.options.result.uniqueId)
    );
  };
  const path = '/html';

  return buildCoreQuickview(
    engine,
    props,
    buildResultPreviewRequest,
    path,
    fetchResultContentCallback
  );
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
