import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {fetchProductListing} from '../../../../features/product-listing/v2/product-listing-v2-actions';
import {
  buildCorePager,
  PagerInitialState,
  PagerOptions,
  PagerProps,
  Pager,
  PagerState,
} from '../../../core/pager/headless-core-pager';

export type {PagerInitialState, PagerOptions, PagerProps, Pager, PagerState};

/**
 * Creates a `Pager` controller instance for the product listing.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `Pager` properties.
 * @returns A `Pager` controller instance.
 * */
export function buildPager(
  engine: CommerceEngine,
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
