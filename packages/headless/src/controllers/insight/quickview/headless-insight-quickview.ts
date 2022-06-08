import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {logDocumentQuickview} from '../../../features/result-preview/result-preview-analytics-actions';
import {
  QuickviewCoreProps,
  QuickviewCoreOptions,
  QuickviewCore,
  QuickviewCoreState,
  buildQuickviewCore,
} from '../../core/quickview/headless-core-quickview';

export interface InsightQuickviewProps extends QuickviewCoreProps {}
export interface InsightQuickviewOptions extends QuickviewCoreOptions {}
export interface InsightQuickview extends QuickviewCore {}
export interface InsightQuickviewState extends QuickviewCoreState {}

/**
 * Creates a `Quickview` controller instance.
 * @param engine - The headless engine.
 * @param props - The configurable `Quickview` properties.
 * @returns A `Quickview` controller instance.
 */
export function buildInsightQuickview(
  engine: InsightEngine,
  props: InsightQuickviewProps
): InsightQuickview {
  const fetchResultContentCallback = () => {
    engine.dispatch(logDocumentQuickview(props.options.result));
  };

  return buildQuickviewCore(engine, props, fetchResultContentCallback);
}
