import {executeSearch} from '../../../features/insight-search/insight-search-actions.js';
import {restoreSearchParameters} from '../../../features/search-parameters/search-parameter-actions.js';
import {initialSearchParameterSelector} from '../../../features/search-parameters/search-parameter-selectors.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockFacetRequest} from '../../../test/mock-facet-request.js';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice.js';
import {buildMockFacetValueRequest} from '../../../test/mock-facet-value-request.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import {
  buildSearchParameterManager,
  type SearchParameterManager,
  type SearchParameterManagerProps,
} from './headless-insight-search-parameter-manager.js';

vi.mock('../../../features/search-parameters/search-parameter-actions');
vi.mock('../../../features/insight-search/insight-search-actions');

describe('insight search parameter manager', () => {
  let engine: MockedInsightEngine;
  let props: SearchParameterManagerProps;
  let manager: SearchParameterManager;

  function initSearchParameterManager() {
    manager = buildSearchParameterManager(engine, props);
  }

  beforeEach(() => {
    vi.resetAllMocks();
    engine = buildMockInsightEngine(buildMockInsightState());
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

      expect(restoreSearchParameters).toHaveBeenCalledWith({
        ...initialParameters,
        ...params,
      });
    });

    it('executes a search', () => {
      manager.synchronize({q: 'a'});
      expect(executeSearch).toHaveBeenCalled();
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
      expect(executeSearch).not.toHaveBeenCalled();
    });
  });
});
