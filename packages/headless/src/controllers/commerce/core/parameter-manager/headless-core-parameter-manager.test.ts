import {SchemaValidationError, StringValue} from '@coveo/bueno';
import {
  CommerceSearchParameters,
  restoreSearchParameters,
} from '../../../../features/commerce/search-parameters/search-parameter-actions';
import {searchParametersDefinition} from '../../../../features/commerce/search-parameters/search-parameter-schema';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {
  buildCoreParameterManager,
  CoreParameterManagerProps,
  ParameterManager,
} from './headless-core-parameter-manager';

jest.mock(
  '../../../../features/commerce/search-parameters/search-parameter-actions'
);
jest.mock('../../../../features/commerce/search/search-actions');

describe('product listing parameter manager', () => {
  let engine: MockedCommerceEngine;
  let parameterManager: ParameterManager<CommerceSearchParameters>;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initParameterManager(
    props: Partial<CoreParameterManagerProps<CommerceSearchParameters>> = {}
  ) {
    parameterManager = buildCoreParameterManager(engine, {
      initialState: {parameters: {}},
      parametersDefinition: searchParametersDefinition,
      activeParametersSelector: (_) => ({q: ''}),
      restoreActionCreator: restoreSearchParameters,
      fetchProductsActionCreator: executeSearch,
      enrichParameters: (_, activeParams) => ({
        q: activeParams.q!,
      }),
      ...props,
    });
  }

  beforeEach(() => {
    jest.resetAllMocks();
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
          parametersDefinition: {
            q: new StringValue({required: true}),
          },
        })
      ).toThrow(SchemaValidationError);
    });

    it('dispatches #restoreActionCreator with initial parameters', () => {
      const mockedRestoreSearchParameters = jest.mocked(
        restoreSearchParameters
      );

      initParameterManager({initialState: {parameters: {q: 'initial query'}}});

      expect(mockedRestoreSearchParameters).toHaveBeenCalledWith({
        q: 'initial query',
      });
    });
  });

  describe('#synchronize', () => {
    describe('when new parameters are the same as the old ones', () => {
      it('does not dispatch any action', () => {
        const mockedRestoreSearchParameters = jest.mocked(
          restoreSearchParameters
        );
        mockedRestoreSearchParameters.mockReset();

        const parameters = {q: ''};
        parameterManager.synchronize(parameters);

        expect(mockedRestoreSearchParameters).not.toHaveBeenCalled();
      });
    });

    describe('when there is a difference in parameters', () => {
      it('dispatches #restoreActionCreator', () => {
        const mockedRestoreSearchParameters = jest.mocked(
          restoreSearchParameters
        );
        const parameters = {
          q: 'new query',
        };
        parameterManager.synchronize(parameters);
        expect(mockedRestoreSearchParameters).toHaveBeenCalledWith({
          q: 'new query',
        });
      });

      it('dispatches #fetchProductsActionCreator', () => {
        const mockedExecuteSearch = jest.mocked(executeSearch);
        const parameters = {};
        parameterManager.synchronize(parameters);
        expect(mockedExecuteSearch).toHaveBeenCalled();
      });
    });
  });

  describe('#state', () => {
    it('contains #parameters', () => {
      initParameterManager({
        activeParametersSelector: () => ({q: 'active parameter!'}),
      });

      expect(parameterManager.state.parameters).toEqual({
        q: 'active parameter!',
      });
    });
  });
});
