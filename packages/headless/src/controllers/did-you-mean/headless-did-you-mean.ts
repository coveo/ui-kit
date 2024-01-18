import {
  QueryCorrection,
  WordCorrection,
} from '../../api/search/search/query-corrections';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  didYouMeanClick,
  logDidYouMeanClick,
} from '../../features/did-you-mean/did-you-mean-analytics-actions';
import {executeSearch} from '../../features/search/search-actions';
import {
  buildCoreDidYouMean,
  DidYouMean,
  DidYouMeanProps,
  DidYouMeanState,
  DidYouMeanOptions,
} from '../core/did-you-mean/headless-core-did-you-mean';

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
