import {SearchEngine} from '../../app/search-engine/search-engine';
import {logDocumentQuickview} from '../../features/result-preview/result-preview-analytics-actions';
import {buildResultPreviewRequest} from '../../features/result-preview/result-preview-request-builder';
import {
  buildCoreQuickview,
  QuickviewOptions,
  QuickviewState,
  QuickviewProps,
  Quickview,
} from '../core/quickview/headless-core-quickview';

export type {QuickviewOptions, QuickviewState, QuickviewProps, Quickview};

/**
 * Creates a `Quickview` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Quickview` properties.
 * @returns A `Quickview` controller instance.
 */
export function buildQuickview(
  engine: SearchEngine,
  props: QuickviewProps
): Quickview {
  const fetchResultContentCallback = () => {
    engine.dispatch(logDocumentQuickview(props.options.result));
  };
  const path = '/html';

  return buildCoreQuickview(
    engine,
    props,
    buildResultPreviewRequest,
    path,
    fetchResultContentCallback
  );
}
