import {CaseAssistEngine} from '../../app//case-assist-engine/case-assist-engine';
import {logQuickviewDocumentSuggestionClick} from '../../features/case-assist/case-assist-analytics-actions';
import {buildResultPreviewRequest} from '../../features/result-preview/result-preview-request-builder';
import {
  buildCoreQuickview,
  QuickviewOptions,
  QuickviewState,
  QuickviewProps,
  Quickview,
} from '../core/quickview/headless-core-quickview';

export interface CaseAssistQuickviewProps extends QuickviewProps {}

export interface CaseAssistQuickviewOptions extends QuickviewOptions {}

export interface CaseAssistQuickview extends Quickview {}

export interface CaseAssistQuickviewState extends QuickviewState {}

/**
 * Creates a `CaseAssistQuickview` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `CaseAssistQuickview` properties.
 * @returns A `CaseAssistQuickview` controller instance.
 */
export function buildCaseAssistQuickview(
  engine: CaseAssistEngine,
  props: CaseAssistQuickviewProps
): CaseAssistQuickview {
  const fetchResultContentCallback = () => {
    engine.dispatch(
      logQuickviewDocumentSuggestionClick(props.options.result.uniqueId)
    );
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
