import {baseInsightUrl} from '../../../api/service/insight/insight-params';
import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {buildInsightResultPreviewRequest} from '../../../features/insight-search/insight-result-preview-request-builder';
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

  const getState = () => engine.state;

  const {platformUrl, accessToken, organizationId} = getState().configuration;
  const {insightId} = getState().insightConfiguration;

  const path = '/quickview';
  const url = baseInsightUrl(
    {
      url: platformUrl,
      accessToken,
      organizationId,
      insightId,
    },
    ''
  );

  return buildCoreQuickview(
    engine,
    {
      options: {
        ...props.options,
        onlyContentURL: true,
      },
    },
    (state, options) => buildInsightResultPreviewRequest(state, options, url),
    path,
    fetchResultContentCallback
  );
}
