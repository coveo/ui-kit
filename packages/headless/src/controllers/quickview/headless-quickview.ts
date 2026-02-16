import type {HtmlApiClient} from '../../api/search/html/html-api-client.js';
import type {CoreEngine} from '../../app/engine.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {preparePreviewPagination} from '../../features/result-preview/result-preview-actions.js';
import {logDocumentQuickview} from '../../features/result-preview/result-preview-analytics-actions.js';
import {buildResultPreviewRequest} from '../../features/result-preview/result-preview-request-builder.js';
import {searchReducer as search} from '../../features/search/search-slice.js';
import type {SearchSection} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {
  buildCoreQuickview,
  type Quickview as CoreQuickview,
  type QuickviewState as CoreQuickviewState,
  type QuickviewOptions,
  type QuickviewProps,
} from '../core/quickview/headless-core-quickview.js';

export type {
  QuickviewOptions,
  QuickviewProps,
  CoreQuickviewState,
  CoreQuickview,
};

/**
 * A scoped and simplified part of the headless state that is relevant to the `Quickview` controller.
 *
 * @group Controllers
 * @category Quickview
 */
export interface QuickviewState extends CoreQuickviewState {
  /**
   * The number of available results for the current result set.
   *
   * Can be used for quickview pagination purpose.
   */
  totalResults: number;
  /**
   * The position of the result in the current result set.
   *
   * Can be used for quickview pagination purpose.
   */
  currentResult: number;
}

/**
 * The `Quickview` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user interacts with a quickview.
 *
 * Example: [quickview.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/quickview/quickview.fn.tsx)
 *
 * @group Controllers
 * @category Quickview
 */
export interface Quickview extends CoreQuickview {
  state: QuickviewState;
}

/**
 * Creates a `Quickview` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Quickview` properties.
 * @returns A `Quickview` controller instance.
 *
 * @group Controllers
 * @category Quickview
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
  const getResults = () => getState().search.results;

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

  dispatch(preparePreviewPagination({results: getResults()}));

  return {
    ...core,

    get state() {
      return {
        ...core.state,
        currentResult:
          getResults().findIndex(
            (r) => r.uniqueId === core.state.currentResultUniqueId
          ) + 1,
        totalResults: getResults().length,
      };
    },
  };
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
