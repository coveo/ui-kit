import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {
  buildMockProductListingEngine,
  MockedProductListingEngine,
} from '../../../test/mock-engine-v2';
import {buildMockProductListingState} from '../../../test/mock-product-listing-state';
import {
  Pager,
  PagerOptions,
  PagerInitialState,
  buildPager,
} from './headless-product-listing-pager';

jest.mock('../../../features/product-listing/product-listing-actions');

describe('Pager', () => {
  let engine: MockedProductListingEngine;
  let options: PagerOptions;
  let initialState: PagerInitialState;
  let pager: Pager;

  function initPager() {
    pager = buildPager(engine, {options, initialState});
  }

  beforeEach(() => {
    options = {};
    initialState = {};
    engine = buildMockProductListingEngine(buildMockProductListingState());
    initPager();
  });

  it('initializes', () => {
    expect(pager).toBeTruthy();
  });

  it('#selectPage dispatches #fetchProductListing', () => {
    pager.selectPage(2);
    expect(fetchProductListing).toHaveBeenCalled();
  });

  it('#nextPage dispatches #fetchProductListing', () => {
    pager.nextPage();
    expect(fetchProductListing).toHaveBeenCalled();
  });

  it('#previousPage dispatches #fetchProductListing', () => {
    pager.previousPage();
    expect(fetchProductListing).toHaveBeenCalled();
  });
});
