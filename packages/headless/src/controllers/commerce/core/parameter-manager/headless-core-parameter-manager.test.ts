import {SchemaValidationError} from '@coveo/bueno';
import type {Parameters} from '../../../../features/commerce/parameters/parameters-actions.js';
import {parametersDefinition} from '../../../../features/commerce/parameters/parameters-schema.js';
import {parametersReducer as commerceParameters} from '../../../../features/commerce/parameters/parameters-slice.js';
import type {FacetValueState} from '../../../../features/facets/facet-api/value.js';
import {buildRelevanceSortCriterion} from '../../../../features/sort/sort.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../../test/mock-engine-v2.js';
import {
  buildCoreParameterManager,
  type CoreParameterManagerProps,
  type ParameterManager,
} from './headless-core-parameter-manager.js';

describe('parameter manager', () => {
  let engine: MockedCommerceEngine;
  let parameterManager: ParameterManager<Parameters>;
  const mockActiveParametersSelector = vi.fn();
  const mockRestoreActionCreator = vi.fn();
  const mockFetchProductsActionCreator = vi.fn();

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

    it('by default, does not load the commerceParameters reducer', () => {
      expect(engine.addReducers).not.toHaveBeenCalledWith({
        commerceParameters,
      });
    });

    it('when excludeDefaultParameters is set to false, does not load the commerceParameters reducer', () => {
      initParameterManager({excludeDefaultParameters: false});
      expect(engine.addReducers).not.toHaveBeenCalledWith({
        commerceParameters,
      });
    });

    it('when excludeDefaultParameters is set to true, loads the commerceParameters reducer', () => {
      initParameterManager({excludeDefaultParameters: true});
      expect(engine.addReducers).toHaveBeenCalledWith({
        commerceParameters,
      });
    });

    describe('when an initial state is provided', () => {
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
  });

  describe('when an initial state is not provided', () => {
    it('does not dispatch #restoreActionCreator', () => {
      mockRestoreActionCreator.mockReset();
      initParameterManager({initialState: undefined});

      expect(mockRestoreActionCreator).not.toHaveBeenCalled();
    });
  });

  describe('#synchronize', () => {
    beforeEach(() => {
      mockRestoreActionCreator.mockReset();
      mockFetchProductsActionCreator.mockReset();
    });
    it('when the new parameters are the same as the previous ones, does not dispatch any action', () => {
      mockRestoreActionCreator.mockReset();
      mockFetchProductsActionCreator.mockReset();

      mockActiveParametersSelector.mockReturnValue({page: 2});
      parameterManager.synchronize({page: 2});

      expect(mockRestoreActionCreator).not.toHaveBeenCalled();
      expect(mockFetchProductsActionCreator).not.toHaveBeenCalled();
    });

    it('when there are no new and no active parameters, dispatches #restoreActionCreator and #fetchProductsActionCreator', () => {
      mockActiveParametersSelector.mockReturnValue({});
      parameterManager.synchronize({});

      expect(mockRestoreActionCreator).toHaveBeenCalled();
      expect(mockFetchProductsActionCreator).toHaveBeenCalled();
    });

    it('when there the new parameters are different from the previous ones, dispatches #restoreActionCreator and #fetchProductsActionCreator', () => {
      mockActiveParametersSelector.mockReturnValue({page: 2});
      parameterManager.synchronize({perPage: 5});

      expect(mockRestoreActionCreator).toHaveBeenCalled();
      expect(mockFetchProductsActionCreator).toHaveBeenCalled();
    });
  });

  describe('#state', () => {
    let parameters: Parameters;

    beforeEach(() => {
      parameters = parameters = {
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
        nfExcluded: {
          price: [
            {
              state: 'excluded' as FacetValueState,
              start: 10,
              end: 20,
              endInclusive: false,
            },
          ],
        },
        mnf: {
          weight: [
            {
              state: 'selected' as FacetValueState,
              start: 10,
              end: 20,
              endInclusive: false,
            },
          ],
        },
        mnfExcluded: {
          height: [
            {
              state: 'excluded' as FacetValueState,
              start: 10,
              end: 20,
              endInclusive: false,
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
        dfExcluded: {
          expires: [
            {
              state: 'excluded' as FacetValueState,
              start: '2010/01/01',
              end: '2011/01/01',
              endInclusive: false,
            },
          ],
        },
        f: {
          size: ['small', 'medium'],
        },
        fExcluded: {
          color: ['red'],
        },
        sortCriteria: buildRelevanceSortCriterion(),
        cf: {
          category: ['electronics'],
        },
      };
    });
    it('by default, #parameters is populated by the activeParametersSelector passed as a prop', () => {
      mockActiveParametersSelector.mockReturnValue(parameters);

      expect(parameterManager.state.parameters).toEqual(parameters);
    });

    it('when excludeDefaultParameters is set to false, #parameters is populated by the activeParametersSelector passed as a prop', () => {
      initParameterManager({
        excludeDefaultParameters: false,
      });

      mockActiveParametersSelector.mockReturnValue(parameters);

      expect(parameterManager.state.parameters).toEqual(parameters);
    });

    it('when excludeDefaultParameters is set to true, #parameters is populated by the commerceParameters slice', () => {
      initEngine({...buildMockCommerceState(), commerceParameters: parameters});
      initParameterManager({
        excludeDefaultParameters: true,
      });

      mockActiveParametersSelector.mockReturnValue({});

      expect(parameterManager.state.parameters).toEqual(parameters);
    });
  });
});
