import type {
  QueryCorrection,
  WordCorrection,
} from '../../../api/search/search/query-corrections.js';
import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {didYouMeanClick} from '../../../features/did-you-mean/did-you-mean-analytics-actions.js';
import {logDidYouMeanClick} from '../../../features/did-you-mean/did-you-mean-insight-analytics-actions.js';
import {executeSearch} from '../../../features/insight-search/insight-search-actions.js';
import {
  buildCoreDidYouMean,
  type DidYouMean,
  type DidYouMeanOptions,
  type DidYouMeanProps,
  type DidYouMeanState,
} from '../../core/did-you-mean/headless-core-did-you-mean.js';

export type {
  QueryCorrection,
  WordCorrection,
  DidYouMean,
  DidYouMeanState,
  DidYouMeanProps,
  DidYouMeanOptions,
};

const defaultDidYouMeanOptions: DidYouMeanOptions = {
  automaticallyCorrectQuery: true,
  queryCorrectionMode: 'legacy',
};

/**
 * The insight DidYouMean controller is responsible for handling query corrections.
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
  engine: InsightEngine,
  props: DidYouMeanProps = {
    options: defaultDidYouMeanOptions,
  }
): DidYouMean {
  const options = {
    ...defaultDidYouMeanOptions,
    ...props.options,
  };

  const controller = buildCoreDidYouMean(engine, {options});
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
