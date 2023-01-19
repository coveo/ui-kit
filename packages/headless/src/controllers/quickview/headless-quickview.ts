import {CoreEngine} from '../..';
import {HtmlApiClient} from '../../api/search/html/html-api-client';
import {search} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {preparePreviewPagination} from '../../features/result-preview/result-preview-actions';
import {logDocumentQuickview} from '../../features/result-preview/result-preview-analytics-actions';
import {buildResultPreviewRequest} from '../../features/result-preview/result-preview-request-builder';
import {SearchSection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {
  buildCoreQuickview,
  QuickviewOptions,
  QuickviewState,
  QuickviewProps,
  Quickview,
} from '../core/quickview/headless-core-quickview';

export type {QuickviewOptions, QuickviewState, QuickviewProps, Quickview};

/**
 * Creates a `Quickview` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Quickview` properties.
 * @returns A `Quickview` controller instance.
 */
export function buildQuickview(
  engine: SearchEngine,
  props: QuickviewProps
): Quickview {
  if (!loadSearchQuickviewReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const getState = () => engine.state;
  dispatch(preparePreviewPagination({results: getState().search.results}));

  const fetchResultContentCallback = () => {
    engine.dispatch(logDocumentQuickview(props.options.result));
  };
  const path = '/html';

  const core = buildCoreQuickview(
    engine,
    props,
    buildResultPreviewRequest,
    path,
    fetchResultContentCallback
  );

  return core;
}

function loadSearchQuickviewReducers(
  engine: CoreEngine
): engine is CoreEngine<
  SearchSection,
  ClientThunkExtraArguments<HtmlApiClient>
> {
  engine.addReducers({search});
  return true;
}
