import {registerInstantProducts} from '../../../features/commerce/instant-products/instant-products-actions';
import {instantProductsReducer} from '../../../features/commerce/instant-products/instant-products-slice';
import {CommerceAppState} from '../../../state/commerce-app-state';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../test/mock-engine-v2';
import {buildInstantProducts} from './headless-instant-products';

jest.mock(
  '../../../features/commerce/instant-products/instant-products-actions'
);

describe('instant products', () => {
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;

  beforeEach(() => {
    jest.useFakeTimers();
    state = buildMockCommerceState();
    engine = buildMockCommerceEngine(state);
  });

  it('adds the correct reducers to engine', () => {
    const searchBoxId = 'search_box_1';
    buildInstantProducts(engine, {
      options: {searchBoxId},
    });

    expect(engine.addReducers).toHaveBeenCalledWith({
      instantProducts: instantProductsReducer,
    });
  });

  it('registers search box', () => {
    const searchBoxId = 'search_box_1';
    buildInstantProducts(engine, {
      options: {searchBoxId},
    });
    expect(registerInstantProducts).toHaveBeenCalledWith({id: searchBoxId});
  });
});
