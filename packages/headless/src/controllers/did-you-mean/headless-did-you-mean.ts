import {SearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import {
  QueryCorrection,
  WordCorrection,
} from '../../api/search/search/query-corrections';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {SearchPageEvents} from '../../features/analytics/search-action-cause';
import {logDidYouMeanClick} from '../../features/did-you-mean/did-you-mean-analytics-actions';
import {executeSearch} from '../../features/search/search-actions';
import {
  buildCoreDidYouMean,
  DidYouMean,
  DidYouMeanState,
} from '../core/did-you-mean/headless-core-did-you-mean';

export type {QueryCorrection, WordCorrection, DidYouMean, DidYouMeanState};

/**
 * The DidYouMean controller is responsible for handling query corrections.
 * When a query returns no result but finds a possible query correction, the controller either suggests the correction or
 * automatically triggers a new query with the suggested term.
 *
 * @param engine - The headless engine.
 */
export function buildDidYouMean(engine: SearchEngine): DidYouMean {
  const controller = buildCoreDidYouMean(engine);
  const {dispatch} = engine;

  return {
    ...controller,

    get state() {
      return controller.state;
    },

    applyCorrection() {
      controller.applyCorrection();
      dispatch(
        executeSearch({
          legacy: logDidYouMeanClick(),
          next: {
            actionCause: SearchPageEvents.didyoumeanClick,
            getEventExtraPayload: (state) =>
              new SearchAnalyticsProvider(() => state).getBaseMetadata(),
          },
        })
      );
    },
  };
}
