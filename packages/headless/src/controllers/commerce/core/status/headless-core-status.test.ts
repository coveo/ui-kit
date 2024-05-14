import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {buildMockProduct} from '../../../../test/mock-product';
import {CoreStatusProps, buildCoreStatus} from './headless-core-status';

describe('CommerceCoreStatus', () => {
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  const coreStatusProps: CoreStatusProps = {
    firstSearchExecutedSelector: jest.fn(),
  };

  const buildStatus = () => buildCoreStatus(engine, coreStatusProps);

  beforeEach(() => {
    jest.resetAllMocks();

    state = buildMockCommerceState();
    engine = buildMockCommerceEngine(state);
  });

  it('it adds the correct reducers to engine', () => {
    buildStatus();
    expect(engine.addReducers).toHaveBeenCalledWith({commerceSearch});
  });

  it('returns right state "isLoading"', () => {
    expect(buildStatus().state.isLoading).toBe(false);

    state.commerceSearch.isLoading = true;
    expect(buildStatus().state.isLoading).toBe(true);
  });

  it('returns right state "hasResults"', () => {
    expect(buildStatus().state.hasResults).toBe(false);

    state.commerceSearch.products = [buildMockProduct()];
    expect(buildStatus().state.hasResults).toBe(true);
  });

  it('returns right state "firstSearchExecuted"', () => {
    expect(buildStatus().state.firstSearchExecuted).toBe(false);

    state.commerceSearch.responseId = '1234567';
    expect(buildStatus().state.firstSearchExecuted).toBe(true);
  });

  it('returns right state "hasError"', () => {
    expect(buildStatus().state.hasError).toBe(false);

    state.commerceSearch.error = {
      message: 'unknown',
      statusCode: 0,
      type: 'unknown',
    };
    expect(buildStatus().state.hasError).toBe(true);
  });
});
