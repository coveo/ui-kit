import type {ChildProduct} from '../../../api/commerce/common/product.js';
import {stateKey} from '../../../app/state-key.js';
import {
  promoteChildToParent,
  registerInstantProducts,
} from '../../../features/commerce/instant-products/instant-products-actions.js';
import {instantProductsReducer} from '../../../features/commerce/instant-products/instant-products-slice.js';
import type {CommerceAppState} from '../../../state/commerce-app-state.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import {
  buildInstantProducts,
  type InstantProducts,
} from './headless-instant-products.js';

vi.mock('../../../features/commerce/instant-products/instant-products-actions');

describe('instant products', () => {
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let instantProducts: InstantProducts;
  const searchBoxId = 'search_box_1';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    state = buildMockCommerceState();
    engine = buildMockCommerceEngine(state);
    instantProducts = buildInstantProducts(engine, {options: {searchBoxId}});
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      instantProducts: instantProductsReducer,
    });
  });

  it('registers search box', () => {
    expect(registerInstantProducts).toHaveBeenCalledWith({id: searchBoxId});
  });

  // TODO KIT-3210 test #updateQuery, #clearExpired, and #state

  it('#promoteChildToParent dispatches #promoteChildToParent with the correct arguments', () => {
    const child = {
      permanentid: 'childPermanentId',
    } as ChildProduct;

    const query = 'query';
    engine[stateKey].instantProducts![searchBoxId] = {
      q: query,
      cache: {},
    };
    instantProducts = buildInstantProducts(engine, {options: {searchBoxId}});

    instantProducts.promoteChildToParent(child);

    expect(promoteChildToParent).toHaveBeenCalledWith({
      child,
      id: searchBoxId,
      query,
    });
  });
});
