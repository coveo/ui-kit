import {stateKey} from '../../../app/state-key';
import {
  registerInstantProducts,
  promoteChildToParent,
} from '../../../features/commerce/instant-products/instant-products-actions';
import {instantProductsReducer} from '../../../features/commerce/instant-products/instant-products-slice';
import {CommerceAppState} from '../../../state/commerce-app-state';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../test/mock-engine-v2';
import {
  InstantProducts,
  buildInstantProducts,
} from './headless-instant-products';

jest.mock(
  '../../../features/commerce/instant-products/instant-products-actions'
);

describe('instant products', () => {
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let instantProducts: InstantProducts;
  const searchBoxId = 'search_box_1';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
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
    const childPermanentId = 'childPermanentId';
    const parentPermanentId = 'parentPermanentId';

    const query = 'query';
    engine[stateKey].instantProducts![searchBoxId] = {
      q: query,
      cache: {},
    };
    instantProducts = buildInstantProducts(engine, {options: {searchBoxId}});

    instantProducts.promoteChildToParent(childPermanentId, parentPermanentId);

    expect(promoteChildToParent).toHaveBeenCalledWith({
      childPermanentId,
      parentPermanentId,
      id: searchBoxId,
      query,
    });
  });
});
