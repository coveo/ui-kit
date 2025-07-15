import type {
  QueryCorrection,
  WordCorrection,
} from '../../api/search/search/query-corrections.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  didYouMeanClick,
  logDidYouMeanClick,
} from '../../features/did-you-mean/did-you-mean-analytics-actions.js';
import {executeSearch} from '../../features/search/search-actions.js';
import {
  buildCoreDidYouMean,
  type DidYouMean,
  type DidYouMeanOptions,
  type DidYouMeanProps,
  type DidYouMeanState,
} from '../core/did-you-mean/headless-core-did-you-mean.js';

export type {
  QueryCorrection,
  WordCorrection,
  DidYouMean,
  DidYouMeanState,
  DidYouMeanProps,
  DidYouMeanOptions,
};

/**
 * The DidYouMean controller is responsible for handling query corrections.
 * When a query returns no result but finds a possible query correction, the controller either suggests the correction or
 * automatically triggers a new query with the suggested term.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `DidYouMean` properties.
 *
 * @group Controllers
 * @category DidYouMean
 */
export function buildDidYouMean(
  engine: SearchEngine,
  props: DidYouMeanProps = {}
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
        executeSearch({
          legacy: logDidYouMeanClick(),
          next: didYouMeanClick(),
        })
      );
    },
  };
}
