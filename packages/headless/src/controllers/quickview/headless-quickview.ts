import {Result} from '../../api/search/search/result';
import {Engine} from '../../app/headless-engine';
import {fetchResultContent} from '../../features/result-preview/result-preview-actions';
import {
  ConfigurationSection,
  ResultPreviewSection,
} from '../../state/state-sections';
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
  canFetchPreview: boolean;
}

/**
 * Creates a `Quickview` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Quickview` properties.
 * @returns A `Quickview` controller instance.
 */
export function buildQuickview(
  engine: Engine<ConfigurationSection & ResultPreviewSection>,
  props: QuickviewProps
): Quickview {
  const {dispatch} = engine;
  const controller = buildController(engine);
  const result = props.options.result;
  const uniqueId = result.uniqueId;

  return {
    ...controller,

    fetchResultContent() {
      dispatch(fetchResultContent({uniqueId}));
    },

    get state() {
      const canFetchPreview = result.hasHtmlVersion;
      const preview = engine.state.resultPreview;
      const content = uniqueId === preview.uniqueId ? preview.content : '';

      return {
        content,
        canFetchPreview,
      };
    },
  };
}
