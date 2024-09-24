import {Result} from '../../../api/search/search/result.js';
import {configuration} from '../../../app/common-reducers.js';
import {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {insightInterfaceReducer as insightInterface} from '../../../features/insight-interface/insight-interface-slice.js';
import {
  buildInsightResultPreviewRequest,
  StateNeededByInsightHtmlEndpoint,
} from '../../../features/insight-search/insight-result-preview-request-builder.js';
import {logDocumentQuickview} from '../../../features/result-preview/result-preview-insight-analytics-actions.js';
import {resultPreviewReducer as resultPreview} from '../../../features/result-preview/result-preview-slice.js';
import {loadReducerError} from '../../../utils/errors.js';
import {Controller} from '../../controller/headless-controller.js';
import {buildCoreQuickview} from '../../core/quickview/headless-core-quickview.js';

export interface QuickviewProps {
  /**
   * The options for the insight `Quickview` controller.
   */
  options: QuickviewOptions;
}

export interface QuickviewOptions {
  /**
   * The result to retrieve a quickview for.
   */
  result: Result;
  /**
   * The maximum preview size to retrieve, in bytes. By default, the full preview is retrieved.
   */
  maximumPreviewSize?: number;
}

export interface Quickview extends Controller {
  /**
   * Updates the `contentURL` state property with the correct URL.
   */
  fetchResultContent(): void;

  /**
   * The state for the `Quickview` controller.
   */
  state: QuickviewState;
}

export interface QuickviewState {
  /**
   * `true` if the configured result has a preview, and `false` otherwise.
   */
  resultHasPreview: boolean;

  /**
   * `true` if content is being fetched, and `false` otherwise.
   */
  isLoading: boolean;

  /**
   * The `src` path to use if rendering the quickview in an iframe.
   */
  contentURL?: string;
}

/**
 * Creates an insight `Quickview` controller instance.
 * @param engine - The insight engine.
 * @param props - The configurable `Quickview` properties.
 * @returns A `Quickview` controller instance.
 */
export function buildQuickview(
  engine: InsightEngine,
  props: QuickviewProps
): Quickview {
  if (!loadQuickviewReducers(engine)) {
    throw loadReducerError;
  }

  const fetchResultContentCallback = () => {
    engine.dispatch(logDocumentQuickview(props.options.result));
  };

  const path = '/quickview';
  const coreProps = {
    options: {
      ...props.options,
      onlyContentURL: true,
    },
  };

  return buildCoreQuickview(
    engine,
    coreProps,
    (state, options) =>
      buildInsightResultPreviewRequest(
        state as StateNeededByInsightHtmlEndpoint,
        options
      ),
    path,
    fetchResultContentCallback
  );
}

function loadQuickviewReducers(
  engine: InsightEngine
): engine is InsightEngine<StateNeededByInsightHtmlEndpoint> {
  engine.addReducers({configuration, resultPreview, insightInterface});
  return true;
}
