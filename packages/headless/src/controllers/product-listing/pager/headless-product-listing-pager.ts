import {
  buildCorePager,
  PagerInitialState,
  PagerOptions,
  PagerProps,
  Pager,
  PagerState,
} from '../../core/pager/headless-core-pager';
import {ProductListingEngine} from '../../../app/product-listing-engine/product-listing-engine';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';

export {PagerInitialState, PagerOptions, PagerProps, Pager, PagerState};

/**
 * Creates a `Pager` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Pager` properties.
 * @returns A `Pager` controller instance.
 * */
export function buildPager(
  engine: ProductListingEngine,
  props: PagerProps = {}
): Pager {
  const {dispatch} = engine;
  const pager = buildCorePager(engine, props);

  return {
    ...pager,

    get state() {
      return pager.state;
    },

    selectPage(page: number) {
      pager.selectPage(page);
      dispatch(fetchProductListing());
    },

    nextPage() {
      pager.nextPage();
      dispatch(fetchProductListing());
    },

    previousPage() {
      pager.previousPage();
      dispatch(fetchProductListing());
    },
  };
}
