import {
  QueryCorrection,
  WordCorrection,
} from '../../../api/search/search/query-corrections';
import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {logDidYouMeanClick} from '../../../features/did-you-mean/did-you-mean-insight-analytics-actions';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {
  buildCoreDidYouMean,
  DidYouMean,
  DidYouMeanState,
} from '../../core/did-you-mean/headless-core-did-you-mean';

export type {QueryCorrection, WordCorrection, DidYouMean, DidYouMeanState};

/**
 * The insight DidYouMean controller is responsible for handling query corrections.
 * When a query returns no result but finds a possible query correction, the controller either suggests the correction or
 * automatically triggers a new query with the suggested term.
 *
 * @param engine - The insight engine.
 */
export function buildDidYouMean(engine: InsightEngine): DidYouMean {
  const controller = buildCoreDidYouMean(engine);
  const {dispatch} = engine;

  return {
    ...controller,

    get state() {
      return controller.state;
    },

    applyCorrection() {
      controller.applyCorrection();
      dispatch(executeSearch(logDidYouMeanClick()));
    },
  };
}
