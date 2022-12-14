import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {restoreSearchParameters} from '../../../features/search-parameters/search-parameter-actions';
import {initialSearchParameterSelector} from '../../../features/search-parameters/search-parameter-selectors';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice';
import {buildMockFacetValueRequest} from '../../../test/mock-facet-value-request';
import {
  buildSearchParameterManager,
  SearchParameterManager,
  SearchParameterManagerProps,
} from './headless-insight-search-parameter-manager';

describe('insight search parameter manager', () => {
  let engine: MockInsightEngine;
  let props: SearchParameterManagerProps;
  let manager: SearchParameterManager;

  function initSearchParameterManager() {
    manager = buildSearchParameterManager(engine, props);
  }

  beforeEach(() => {
    engine = buildMockInsightEngine();
    props = {
      initialState: {
        parameters: {},
      },
    };

    initSearchParameterManager();
  });

  describe('#synchronize', () => {
    it('given partial search parameters, it dispatches #restoreSearchParameters with non-specified parameters set to their initial values', () => {
      const params = {q: 'a'};
      manager.synchronize(params);

      const initialParameters = initialSearchParameterSelector(engine.state);
      const action = restoreSearchParameters({
        ...initialParameters,
        ...params,
      });

      expect(engine.actions).toContainEqual(action);
    });

    it('executes a search', () => {
      manager.synchronize({q: 'a'});
      expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
    });

    it(`when only the order of facet values changes,
    calling #synchronize does not execute a search`, () => {
      const value1 = 'Kafka';
      const value2 = 'Cervantes';

      const facetValue1 = buildMockFacetValueRequest({
        value: value1,
        state: 'selected',
      });
      const facetValue2 = buildMockFacetValueRequest({
        value: value2,
        state: 'selected',
      });

      engine.state.facetSet = {
        author: buildMockFacetSlice({
          request: buildMockFacetRequest({
            currentValues: [facetValue1, facetValue2],
          }),
        }),
      };

      manager.synchronize({f: {author: [value2, value1]}});

      expect(engine.findAsyncAction(executeSearch.pending)).toBeFalsy();
    });
  });
});
