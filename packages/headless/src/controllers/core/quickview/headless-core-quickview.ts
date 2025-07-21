import type {HtmlApiClient} from '../../../api/search/html/html-api-client.js';
import type {
  HtmlRequest,
  HtmlRequestOptions,
} from '../../../api/search/html/html-request.js';
import type {Result} from '../../../api/search/search/result.js';
import {configuration} from '../../../app/common-reducers.js';
import type {CoreEngine} from '../../../app/engine.js';
import type {ClientThunkExtraArguments} from '../../../app/thunk-extra-arguments.js';
import {
  fetchResultContent,
  nextPreview,
  previousPreview,
  updateContentURL,
} from '../../../features/result-preview/result-preview-actions.js';
import type {StateNeededByHtmlEndpoint} from '../../../features/result-preview/result-preview-request-builder.js';
import {resultPreviewReducer as resultPreview} from '../../../features/result-preview/result-preview-slice.js';
import type {
  ConfigurationSection,
  ResultPreviewSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';

export interface QuickviewProps {
  /**
   * The options for the `Quickview` controller.
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
   */
  onlyContentURL?: boolean;
}

export interface Quickview extends Controller {
  /**
   * Retrieves the preview content for the configured result.
   * If `options.onlyContentURL` is `true` this will update the `contentURL` state property rather than `content`.
   */
  fetchResultContent(): void;

  /**
   * Retrieves the preview content for the next available result in the current result set.
   *
   * If it reaches the last available result in the current result set, it will not perform an additional query to fetch new results.
   *
   * Instead, it will loop back to the first available result.
   *
   * If `options.onlyContentURL` is `true` this will update the `contentURL` state property rather than `content`.
   */
  next(): void;
  /**
   * Retrieves the preview content for the previous available result in the current result set.
   *
   * If it reaches the first available result in the current result set, it will not perform an additional query to fetch new results.
   *
   * Instead, it will loop back to the last available result.
   *
   * If `options.onlyContentURL` is `true` this will update the `contentURL` state property rather than `content`.
   */
  previous(): void;

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

  /**
   * The current result unique ID,
   */
  currentResultUniqueId: string;
}

/**
 * Creates a `Quickview` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Quickview` properties.
 * @param fetchResultContentCallback - The callback to be triggered after executing fetchResultContent.
 * @returns A `Quickview` controller instance.
 */
export function buildCoreQuickview(
  engine: CoreEngine,
  props: QuickviewProps,
  buildResultPreviewRequest: (
    state: StateNeededByHtmlEndpoint,
    options: HtmlRequestOptions
  ) => Promise<HtmlRequest>,
  path: string,
  fetchResultContentCallback?: () => void
): Quickview {
  if (!loadQuickviewReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const getState = () => engine.state;
  const controller = buildController(engine);
  const {result, maximumPreviewSize} = props.options;

  const getUniqueIdFromPosition = () => {
    const {resultsWithPreview, position} = getState().resultPreview;
    return resultsWithPreview[position];
  };

  const onFetchContent = (uniqueId: string) => {
    dispatch(
      updateContentURL({
        uniqueId,
        requestedOutputSize: maximumPreviewSize,
        buildResultPreviewRequest,
        path,
      })
    );

    if (!props.options.onlyContentURL) {
      dispatch(
        fetchResultContent({
          uniqueId,
          requestedOutputSize: maximumPreviewSize,
        })
      );
    }

    if (fetchResultContentCallback) {
      fetchResultContentCallback();
    }
  };

  return {
    ...controller,

    fetchResultContent() {
      onFetchContent(result.uniqueId);
    },

    next() {
      dispatch(nextPreview());
      onFetchContent(getUniqueIdFromPosition());
    },

    previous() {
      dispatch(previousPreview());
      onFetchContent(getUniqueIdFromPosition());
    },

    get state() {
      const state = getState();
      const resultHasPreview = result.hasHtmlVersion;
      const preview = state.resultPreview;
      const content =
        result.uniqueId === preview.uniqueId ? preview.content : '';
      const isLoading = preview.isLoading;
      const contentURL = preview.contentURL;
      const currentResultUniqueId = getUniqueIdFromPosition();

      return {
        content,
        resultHasPreview,
        isLoading,
        contentURL,
        currentResultUniqueId,
      };
    },
  };
}

function loadQuickviewReducers(
  engine: CoreEngine
): engine is CoreEngine<
  ConfigurationSection & ResultPreviewSection,
  ClientThunkExtraArguments<HtmlApiClient>
> {
  engine.addReducers({configuration, resultPreview});
  return true;
}
