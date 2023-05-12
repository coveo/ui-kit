import {Result} from '../../../api/search/search/result';
import {configuration} from '../../../app/common-reducers';
import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {resultPreview, insightInterface} from '../../../app/reducers';
import {
  buildInsightResultPreviewRequest,
  StateNeededByInsightHtmlEndpoint,
} from '../../../features/insight-search/insight-result-preview-request-builder';
import {logDocumentQuickview} from '../../../features/result-preview/result-preview-analytics-actions';
import {loadReducerError} from '../../../utils/errors';
import {Controller} from '../../controller/headless-controller';
import {buildCoreQuickview} from '../../core/quickview/headless-core-quickview';

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
  /**
   * Whether to only update the `contentURL` attribute when using `fetchResultContent` rather than updating `content`.
   * Use this if you are using an iframe with `state.contentURL` as the source url.
   * @deprecated This option is always set to `true` ad the Insight Quickview only supports `contentURL` mode.
   */
  onlyContentURL?: boolean;
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
   * The result preview HTML content.
   *
   * @default ""
   * @deprecated This value will always be empty as the InsightQuickview only supports usage of the `contentURL`.
   */
  content: string;

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
