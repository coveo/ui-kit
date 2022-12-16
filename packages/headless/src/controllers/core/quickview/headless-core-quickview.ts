import {CoreEngine} from '../../..';
import {HtmlApiClient} from '../../../api/search/html/html-api-client';
import {
  HtmlRequest,
  HtmlRequestOptions,
} from '../../../api/search/html/html-request';
import {Result} from '../../../api/search/search/result';
import {configuration, resultPreview} from '../../../app/reducers';
import {ClientThunkExtraArguments} from '../../../app/thunk-extra-arguments';
import {
  fetchResultContent,
  updateContentURL,
} from '../../../features/result-preview/result-preview-actions';
import {StateNeededByHtmlEndpoint} from '../../../features/result-preview/result-preview-request-builder';
import {
  ConfigurationSection,
  ResultPreviewSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

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
  const uniqueId = result.uniqueId;

  return {
    ...controller,

    fetchResultContent() {
      props.options.onlyContentURL
        ? dispatch(
            updateContentURL({
              uniqueId,
              requestedOutputSize: maximumPreviewSize,
              buildResultPreviewRequest,
              path,
            })
          )
        : dispatch(
            fetchResultContent({
              uniqueId,
              requestedOutputSize: maximumPreviewSize,
            })
          );
      if (fetchResultContentCallback) {
        fetchResultContentCallback();
      }
    },

    get state() {
      const state = getState();
      const resultHasPreview = result.hasHtmlVersion;
      const preview = state.resultPreview;
      const content = uniqueId === preview.uniqueId ? preview.content : '';
      const isLoading = preview.isLoading;
      const contentURL = preview.contentURL;

      return {
        content,
        resultHasPreview,
        isLoading,
        contentURL,
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
