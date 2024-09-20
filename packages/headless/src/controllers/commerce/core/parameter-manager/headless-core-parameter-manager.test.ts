import {SchemaValidationError} from '@coveo/bueno';
import {Parameters} from '../../../../features/commerce/parameters/parameters-actions.js';
import {parametersDefinition} from '../../../../features/commerce/parameters/parameters-schema.js';
import {FacetValueState} from '../../../../features/facets/facet-api/value.js';
import {buildRelevanceSortCriterion} from '../../../../features/sort/sort.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2.js';
import {
  buildCoreParameterManager,
  CoreParameterManagerProps,
  ParameterManager,
} from './headless-core-parameter-manager.js';

describe('parameter manager', () => {
  let engine: MockedCommerceEngine;
  let parameterManager: ParameterManager<Parameters>;
  const mockActiveParametersSelector = vi.fn();
  const mockRestoreActionCreator = vi.fn();
  const mockFetchProductsActionCreator = vi.fn();
  const mockEnrichParameters = vi.fn();

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initParameterManager(
    props: Partial<CoreParameterManagerProps<Parameters>> = {}
  ) {
    parameterManager = buildCoreParameterManager(engine, {
      initialState: {parameters: {}},
      parametersDefinition,
      activeParametersSelector: mockActiveParametersSelector,
      restoreActionCreator: mockRestoreActionCreator,
      fetchProductsActionCreator: mockFetchProductsActionCreator,
      enrichParameters: mockEnrichParameters,
      ...props,
    });
  }

  beforeEach(() => {
    vi.resetAllMocks();
    initEngine();
    initParameterManager();
  });

  it('exposes #subscribe method', () => {
    expect(parameterManager.subscribe).toBeTruthy();
  });

  describe('initialization', () => {
    it('initializes', () => {
      expect(parameterManager).toBeTruthy();
    });

    it('validates initial state against schema', () => {
      expect(() =>
        initParameterManager({
          initialState: {parameters: {page: -1}},
          parametersDefinition,
        })
      ).toThrow(SchemaValidationError);
    });

    it('dispatches #restoreActionCreator with initial parameters', () => {
      initParameterManager({initialState: {parameters: {page: 2}}});

      expect(mockRestoreActionCreator).toHaveBeenCalledWith({
        page: 2,
      });
    });
  });

  describe('#synchronize', () => {
    describe('when new parameters are the same as the old ones', () => {
      it('does not dispatch any action', () => {
        mockRestoreActionCreator.mockReset();

        const parameters = {page: 2};
        parameterManager.synchronize(parameters);

        expect(mockRestoreActionCreator).not.toHaveBeenCalled();
      });
    });

    describe('when there is a difference in parameters', () => {
      beforeEach(() => {
        mockActiveParametersSelector.mockReturnValue({page: 1});
        mockEnrichParameters.mockImplementation((_, params) => params);
      });

      it('dispatches #restoreActionCreator', () => {
        const parameters = {
          page: 2,
        };
        parameterManager.synchronize(parameters);
        expect(mockRestoreActionCreator).toHaveBeenCalledWith(parameters);
      });

      it('dispatches #fetchProductsActionCreator', () => {
        parameterManager.synchronize({page: 2});
        expect(mockFetchProductsActionCreator).toHaveBeenCalled();
      });
    });
  });

  describe('#state', () => {
    it('contains #parameters', () => {
      const parameters = {
        nf: {
          rating: [
            {
              state: 'selected' as FacetValueState,
              start: 4,
              end: 5,
              endInclusive: true,
            },
          ],
        },
        page: 1,
        perPage: 2,
        df: {
          year: [
            {
              state: 'selected' as FacetValueState,
              start: '2010/01/01',
              end: '2011/01/01',
              endInclusive: false,
            },
          ],
        },
        f: {
          size: ['small', 'medium'],
        },
        sortCriteria: buildRelevanceSortCriterion(),
        cf: {
          category: ['electronics'],
        },
      };

      mockActiveParametersSelector.mockReturnValue(parameters);

      expect(parameterManager.state.parameters).toEqual(parameters);
    });
  });
});
