import type {CommerceEngineState} from '../../../../app/commerce-engine/commerce-engine.js';
import type {CommerceAppState} from '../../../../state/commerce-app-state.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../../test/mock-engine-v2.js';
import type {SearchSummaryState} from '../../search/summary/headless-search-summary.js';
import {
  buildCoreSummary,
  type Summary,
  type SummaryOptions,
  type SummaryState,
} from './headless-core-summary.js';

describe('commerce core summary', () => {
  let state: CommerceAppState;
  let engine: MockedCommerceEngine;
  let summary: Summary;
  let options = {
    responseIdSelector: vi.fn(),
    isLoadingSelector: vi.fn(),
    errorSelector: vi.fn(),
    numberOfProductsSelector: vi.fn(),
    pageSelector: vi.fn(),
    perPageSelector: vi.fn(),
    totalEntriesSelector: vi.fn(),
  };

  function initSummary<S extends SummaryState = SummaryState>(
    summaryOptions: SummaryOptions<S> = options
  ) {
    engine = buildMockCommerceEngine(state);
    summary = buildCoreSummary(engine, {options: summaryOptions});
  }

  beforeEach(() => {
    vi.resetAllMocks();
    options = {
      responseIdSelector: vi.fn(),
      isLoadingSelector: vi.fn(),
      errorSelector: vi.fn(),
      numberOfProductsSelector: vi.fn(),
      pageSelector: vi.fn(),
      perPageSelector: vi.fn(),
      totalEntriesSelector: vi.fn(),
    };

    state = buildMockCommerceState();

    initSummary();
  });

  it.each([
    {
      error: null,
      expected: false,
    },
    {
      error: {
        statusCode: 400,
        message: 'error',
        type: 'some error type',
      },
      expected: true,
    },
  ])(
    'should return correct state when there is an error',
    ({error, expected}) => {
      options.errorSelector.mockReturnValue(error);
      expect(summary.state.hasError).toEqual(expected);
    }
  );

  it('should return correct state when no search has been executed', () => {
    options.responseIdSelector.mockReturnValue('');

    expect(summary.state.firstRequestExecuted).toEqual(false);
    expect(summary.state.firstProduct).toEqual(0);
    expect(summary.state.lastProduct).toEqual(0);
    expect(summary.state.hasProducts).toEqual(false);
  });

  it('should return correct state when search has been executed but no products are returned', () => {
    initSummary<SearchSummaryState>({
      ...options,
      responseIdSelector: () => 'responseId',
      isLoadingSelector: () => false,
      totalEntriesSelector: () => 0,
      errorSelector: () => null,
      enrichSummary: (_: CommerceEngineState) => ({
        query: 'foo',
      }),
    });

    expect(summary.state).toEqual({
      firstProduct: 0,
      firstRequestExecuted: true,
      lastProduct: 0,
      totalNumberOfProducts: 0,
      hasProducts: false,
      hasError: false,
      query: 'foo',
      isLoading: false,
    });
  });

  it('should return correct state when on the first page', () => {
    initSummary<SearchSummaryState>({
      ...options,
      pageSelector: () => 0,
      perPageSelector: () => 20,
      totalEntriesSelector: () => 100,
      responseIdSelector: () => 'responseId',
      isLoadingSelector: () => false,
      errorSelector: () => null,
      numberOfProductsSelector: () => 20,
      enrichSummary: (_: CommerceEngineState) => ({
        query: 'foo',
      }),
    });
    expect(summary.state).toEqual({
      firstProduct: 1,
      firstRequestExecuted: true,
      lastProduct: 20,
      totalNumberOfProducts: 100,
      hasProducts: true,
      hasError: false,
      query: 'foo',
      isLoading: false,
    });
  });

  it('should return correct state when not on the first page', () => {
    initSummary<SearchSummaryState>({
      ...options,
      pageSelector: () => 3,
      perPageSelector: () => 20,
      totalEntriesSelector: () => 100,
      responseIdSelector: () => 'responseId',
      isLoadingSelector: () => false,
      errorSelector: () => null,
      numberOfProductsSelector: () => 20,
      enrichSummary: (_: CommerceEngineState) => ({
        query: 'foo',
      }),
    });
    expect(summary.state).toEqual({
      firstProduct: 61,
      firstRequestExecuted: true,
      lastProduct: 80,
      totalNumberOfProducts: 100,
      hasProducts: true,
      hasError: false,
      query: 'foo',
      isLoading: false,
    });
  });

  it('should return correct state when loading', () => {
    options.isLoadingSelector.mockReturnValue(true);
    options.errorSelector.mockReturnValue(null);
    options.totalEntriesSelector.mockReturnValue(0);

    expect(summary.state).toEqual({
      firstProduct: 0,
      firstRequestExecuted: false,
      lastProduct: 0,
      totalNumberOfProducts: 0,
      hasProducts: false,
      hasError: false,
      isLoading: true,
    });
  });
});
