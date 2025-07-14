import type {SearchAPIClient} from '../../../api/search/search-api-client.js';
import type {ClientThunkExtraArguments} from '../../../app/thunk-extra-arguments.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import {logSearchboxSubmit} from '../../query/query-analytics-actions.js';
import {
  executeSearch,
  fetchFacetValues,
  fetchInstantResults,
  fetchMoreResults,
  fetchPage,
} from './search-actions.js';

describe('search actions', () => {
  let e: MockedSearchEngine;
  let apiClient: SearchAPIClient;

  const mockExtraArguments = () =>
    ({
      apiClient,
      logger: e.logger,
    }) as unknown as ClientThunkExtraArguments<SearchAPIClient>;

  beforeEach(() => {
    vi.resetAllMocks();
    apiClient = {
      search: vi.fn(),
    } as unknown as SearchAPIClient;
    e = buildMockSearchEngine(createMockState());
  });

  describe('the search request "origin"', () => {
    it('with #executeSearch', async () => {
      await executeSearch(logSearchboxSubmit())(
        e.dispatch,
        () => e.state,
        mockExtraArguments()
      );
      expect(apiClient.search).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          origin: 'mainSearch',
        })
      );
    });

    it('with #fetchPage', async () => {
      await fetchPage(logSearchboxSubmit())(
        e.dispatch,
        () => e.state,
        mockExtraArguments()
      );
      expect(apiClient.search).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          origin: 'mainSearch',
        })
      );
    });

    it('with #fetchMoreResults', async () => {
      await fetchMoreResults()(e.dispatch, () => e.state, mockExtraArguments());
      expect(apiClient.search).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          origin: 'mainSearch',
        })
      );
    });

    it('with #fetchInstantResults', async () => {
      const q = 'test';
      const numberOfResults = 10;
      await fetchInstantResults({
        q,
        maxResultsPerQuery: numberOfResults,
        id: 'some-id',
      })(
        e.dispatch,
        () => e.state as Required<typeof e.state>,
        mockExtraArguments()
      );

      expect(apiClient.search).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          origin: 'instantResults',
          disableAbortWarning: true,
        })
      );
    });

    it('with #fetchFacetValues', async () => {
      await fetchFacetValues(logSearchboxSubmit())(
        e.dispatch,
        () => e.state,
        mockExtraArguments()
      );

      expect(apiClient.search).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          origin: 'facetValues',
        })
      );
    });
  });
});
