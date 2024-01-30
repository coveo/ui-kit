import {Action} from '@reduxjs/toolkit';
import {
  CommerceSearchParameters,
  restoreSearchParameters,
} from '../../../../features/commerce/search-parameters/search-parameter-actions';
import {searchParametersDefinition} from '../../../../features/commerce/search-parameters/search-parameter-schema';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {
  buildCoreParameterManager,
  ParameterManager,
} from './headless-core-parameter-manager';

describe('product listing parameter manager', () => {
  let engine: MockCommerceEngine;
  let parameterManager: ParameterManager<CommerceSearchParameters>;

  function initParameterManager(props: Partial<CommerceSearchParameters> = {}) {
    engine = buildMockCommerceEngine();

    parameterManager = buildCoreParameterManager(engine, {
      initialState: {parameters: {}},
      parametersDefinition: searchParametersDefinition,
      activeParametersSelector: (_) => ({q: ''}),
      restoreActionCreator: restoreSearchParameters,
      fetchResultsActionCreator: executeSearch,
      enrichParameters: (_, activeParams) => ({
        q: activeParams.q!,
      }),
      ...props,
    });
  }

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  beforeEach(() => {
    initParameterManager();
  });

  it('exposes #subscribe method', () => {
    expect(parameterManager.subscribe).toBeTruthy();
  });

  describe('initialization', () => {
    it('validates initial state against schema', () => {});

    it('dispatches #restoreActionCreator', () => {
      expectContainAction(restoreSearchParameters({}));
    });
  });

  describe('#synchronize', () => {
    describe('when new parameters are the same as the old ones', () => {
      it('does not dispatch any action', () => {
        const parameters = {q: ''};
        parameterManager.synchronize(parameters);

        expectContainAction(restoreSearchParameters({}));
        expect(engine.actions).toHaveLength(1);
      });
    });

    describe('when there is a difference in parameters', () => {
      it('dispatches #restoreActionCreator', () => {
        const parameters = {
          q: 'new query',
        };
        parameterManager.synchronize(parameters);
        expectContainAction(
          restoreSearchParameters({
            q: 'new query',
          })
        );
      });

      it('dispatches #fetchResultsActionCreator', () => {
        const parameters = {};
        parameterManager.synchronize(parameters);
        expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
      });
    });
  });

  describe('#state', () => {
    it('contains #parameters', () => {
      expect(parameterManager.state.parameters).toEqual({
        q: '',
      });
    });
  });
});
