import {Result} from '../../api/search/search/result';
import {Engine} from '../../app/headless-engine';
import {configuration, resultPreview} from '../../app/reducers';
import {fetchResultContent} from '../../features/result-preview/result-preview-actions';
import {logDocumentQuickview} from '../../features/result-preview/result-preview-analytics-actions';
import {
  ConfigurationSection,
  ResultPreviewSection,
} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {buildController, Controller} from '../controller/headless-controller';

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
   * The maximum file size in bytes rendered by the quickview window.
   */
  maximumPreviewSize: number;
}

export interface Quickview extends Controller {
  /**
   * Retrieves the preview content for the configured result.
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
}

/**
 * Creates a `Quickview` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Quickview` properties.
 * @returns A `Quickview` controller instance.
 */
export function buildQuickview(
  engine: Engine<object>,
  props: QuickviewProps
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
      dispatch(
        fetchResultContent({uniqueId, requestedOutputSize: maximumPreviewSize})
      );
      dispatch(logDocumentQuickview(result));
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
  engine: Engine<object>
): engine is Engine<ConfigurationSection & ResultPreviewSection> {
  engine.addReducers({configuration, resultPreview});
  return true;
}
