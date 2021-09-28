import {
  Pager,
  PagerOptions,
  PagerInitialState,
  buildPager,
} from './headless-product-listing-pager';
import {
  buildMockProductListingEngine,
  MockProductListingEngine,
} from '../../../test/mock-engine';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';

describe('Pager', () => {
  let engine: MockProductListingEngine;
  let options: PagerOptions;
  let initialState: PagerInitialState;
  let pager: Pager;

  function initPager() {
    pager = buildPager(engine, {options, initialState});
  }

  beforeEach(() => {
    options = {};
    initialState = {};
    engine = buildMockProductListingEngine();
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
