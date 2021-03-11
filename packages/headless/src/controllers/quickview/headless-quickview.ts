import {Result} from '../../api/search/search/result';
import {Engine} from '../../app/headless-engine';
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
   * Retrieves the preview for the configured result.
   */
  fetchResultPreview(): void;

  /**
   * The state for the `Quickview` controller.
   */
  state: QuickviewState;
}

export interface QuickviewState {
  hasPreview: boolean;
  previewContent: string;
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
  const controller = buildController(engine);

  return {
    ...controller,

    fetchResultPreview() {},

    get state() {
      return {
        hasPreview: !!props.options.result.uniqueId,
        previewContent: '',
      };
    },
  };
}
