import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {logDocumentQuickview} from '../../../features/result-preview/result-preview-analytics-actions';
import {
  QuickviewProps,
  QuickviewOptions,
  Quickview,
  QuickviewState,
  buildCoreQuickview,
} from '../../core/quickview/headless-core-quickview';

export type {QuickviewOptions, QuickviewState, QuickviewProps, Quickview};

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
  const fetchResultContentCallback = () => {
    engine.dispatch(logDocumentQuickview(props.options.result));
  };

  return buildCoreQuickview(engine, props, fetchResultContentCallback);
}
