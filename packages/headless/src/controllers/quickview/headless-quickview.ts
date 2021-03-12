import {Result} from '../../api/search/search/result';
import {Engine} from '../../app/headless-engine';
import {fetchResultContent} from '../../features/result-preview/result-preview-actions';
import {buildController, Controller} from '../controller/headless-controller';

export interface QuickviewProps {
  /**
   * The options for the `Quickview` controller.
   */
  options: QuickviewOptions;
}

export interface QuickviewOptions {
  /**
   *
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
   * The result content.
   *
   * @default ""
   */
  resultContent: string;
}

/**
 * Creates a `Quickview` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Quickview` properties.
 * @returns A `Quickview` controller instance.
 */
export function buildQuickview(
  engine: Engine,
  props: QuickviewProps
): Quickview {
  const {dispatch} = engine;
  const controller = buildController(engine);

  return {
    ...controller,

    fetchResultContent() {
      const uniqueId = props.options.result.uniqueId;
      dispatch(fetchResultContent({uniqueId}));
    },

    get state() {
      return {
        resultContent: '',
      };
    },
  };
}
