import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {
  buildInsightResultPreviewRequest,
  StateNeededByInsightHtmlEndpoint,
} from '../../../features/insight-search/insight-result-preview-request-builder';
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
