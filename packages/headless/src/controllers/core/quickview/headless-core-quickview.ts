import {Result} from '../../../api/search/search/result';
import {configuration, resultPreview} from '../../../app/reducers';
import {fetchResultContent} from '../../../features/result-preview/result-preview-actions';
import {
  ConfigurationSection,
  ResultPreviewSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {CoreEngine} from '../../..';
import {HtmlApiClient} from '../../../api/search/html/html-api-client';
import {ClientThunkExtraArguments} from '../../../app/thunk-extra-arguments';

export interface QuickviewCoreProps {
  /**
   * The options for the `QuickviewCore` controller.
   */
  options: QuickviewCoreOptions;
}

export interface QuickviewCoreOptions {
  /**
   * The result to retrieve a quickview for.
   */
  result: Result;

  /**
   * The maximum preview size to retrieve, in bytes. By default, the full preview is retrieved.
   */
  maximumPreviewSize?: number;
}

export interface QuickviewCore extends Controller {
  /**
   * Retrieves the preview content for the configured result.
   */
  fetchResultContent(): void;

  /**
   * The state for the `QuickviewCore` controller.
   */
  state: QuickviewCoreState;
}

export interface QuickviewCoreState {
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
}

/**
 * Creates a Quickview controller core instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `QuickviewCore` properties.
 * @param fetchResultContentCallback - The callback to be triggered after executing fetchResultContent.
 * @returns A `QuickviewCore` controller instance.
 */
export function buildQuickviewCore(
  engine: CoreEngine,
  props: QuickviewCoreProps,
  fetchResultContentCallback?: () => void
): QuickviewCore {
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
      dispatch(
        fetchResultContent({uniqueId, requestedOutputSize: maximumPreviewSize})
      );
      if (fetchResultContentCallback) {
        fetchResultContentCallback();
      }
    },

    get state() {
      const resultHasPreview = result.hasHtmlVersion;
      const preview = getState().resultPreview;
      const content = uniqueId === preview.uniqueId ? preview.content : '';
      const isLoading = preview.isLoading;

      return {
        content,
        resultHasPreview,
        isLoading,
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
