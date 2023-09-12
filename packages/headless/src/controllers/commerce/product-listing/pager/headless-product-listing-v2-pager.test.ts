import {fetchProductListing} from '../../../../features/product-listing/v2/product-listing-v2-actions';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {
  Pager,
  PagerOptions,
  PagerInitialState,
  buildPager,
} from './headless-product-listing-v2-pager';

describe('Pager', () => {
  let engine: MockCommerceEngine;
  let options: PagerOptions;
  let initialState: PagerInitialState;
  let pager: Pager;

  function initPager() {
    pager = buildPager(engine, {options, initialState});
  }

  beforeEach(() => {
    options = {};
    initialState = {};
    engine = buildMockCommerceEngine();
    initPager();
  });

  it('initializes', () => {
    expect(pager).toBeTruthy();
  });

  it('#selectPage dispatches #fetchProductListing', () => {
    pager.selectPage(2);
    const action = engine.findAsyncAction(fetchProductListing.pending);
    expect(action).toBeTruthy();
  });

  it('#nextPage dispatches #fetchProductListing', () => {
    pager.nextPage();
    const action = engine.findAsyncAction(fetchProductListing.pending);
    expect(action).toBeTruthy();
  });

  it('#previousPage dispatches #fetchProductListing', () => {
    pager.previousPage();
    const action = engine.findAsyncAction(fetchProductListing.pending);
    expect(engine.actions).toContainEqual(action);
  });
});
