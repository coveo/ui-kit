import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {buildMockProduct} from '../../../../test/mock-product';
import {buildCoreStatus} from './headless-core-status';

describe('CommerceCoreStatus', () => {
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;

  beforeEach(() => {
    jest.resetAllMocks();

    state = buildMockCommerceState();
    engine = buildMockCommerceEngine(state);
  });

  it('it adds the correct reducers to engine', () => {
    buildCoreStatus(engine);
    expect(engine.addReducers).toHaveBeenCalledWith({commerceSearch});
  });

  it('returns right state "isLoading"', () => {
    expect(buildCoreStatus(engine).state.isLoading).toBe(false);

    state.commerceSearch.isLoading = true;
    expect(buildCoreStatus(engine).state.isLoading).toBe(true);
  });

  it('returns right state "hasResults"', () => {
    expect(buildCoreStatus(engine).state.hasResults).toBe(false);

    state.commerceSearch.products = [buildMockProduct()];
    expect(buildCoreStatus(engine).state.hasResults).toBe(true);
  });

  it('returns right state "firstSearchExecuted"', () => {
    expect(buildCoreStatus(engine).state.firstSearchExecuted).toBe(false);

    state.commerceSearch.responseId = '1234567';
    expect(buildCoreStatus(engine).state.firstSearchExecuted).toBe(true);
  });

  it('returns right state "hasError"', () => {
    expect(buildCoreStatus(engine).state.hasError).toBe(false);

    state.commerceSearch.error = {
      message: 'unknown',
      statusCode: 0,
      type: 'unknown',
    };
    expect(buildCoreStatus(engine).state.hasError).toBe(true);
  });
});
