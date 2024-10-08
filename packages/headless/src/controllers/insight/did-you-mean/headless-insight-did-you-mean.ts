import {
  QueryCorrection,
  WordCorrection,
} from '../../../api/search/search/query-corrections.js';
import {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {didYouMeanClick} from '../../../features/did-you-mean/did-you-mean-analytics-actions.js';
import {logDidYouMeanClick} from '../../../features/did-you-mean/did-you-mean-insight-analytics-actions.js';
import {executeSearch} from '../../../features/insight-search/insight-search-actions.js';
import {
  buildCoreDidYouMean,
  DidYouMean,
  DidYouMeanProps,
  DidYouMeanState,
  DidYouMeanOptions,
} from '../../core/did-you-mean/headless-core-did-you-mean.js';

export type {
  QueryCorrection,
  WordCorrection,
  DidYouMean,
  DidYouMeanState,
  DidYouMeanProps,
  DidYouMeanOptions,
};

/**
 * The insight DidYouMean controller is responsible for handling query corrections.
 * When a query returns no result but finds a possible query correction, the controller either suggests the correction or
 * automatically triggers a new query with the suggested term.
 *
 * @param engine - The insight engine.
 */
export function buildDidYouMean(
  engine: InsightEngine,
  props: DidYouMeanProps
): DidYouMean {
  const controller = buildCoreDidYouMean(engine, props);
  const {dispatch} = engine;

  return {
    ...controller,

    get state() {
      return controller.state;
    },

    applyCorrection() {
      controller.applyCorrection();
      dispatch(
        executeSearch({legacy: logDidYouMeanClick(), next: didYouMeanClick()})
      );
    },
  };
}
