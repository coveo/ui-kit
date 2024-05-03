import {SearchAPIClient} from '../../../api/search/search-api-client';
import {ClientThunkExtraArguments} from '../../../app/thunk-extra-arguments';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../../test/mock-engine-v2';
import {createMockState} from '../../../test/mock-state';
import {logSearchboxSubmit} from '../../query/query-analytics-actions';
import {
  executeSearch,
  fetchInstantResults,
  fetchFacetValues,
  fetchPage,
  fetchMoreResults,
} from './search-actions';

describe('search actions', () => {
  let e: MockedSearchEngine;
  let apiClient: SearchAPIClient;

  const mockExtraArguments = () =>
    ({
      apiClient,
      logger: e.logger,
    }) as unknown as ClientThunkExtraArguments<SearchAPIClient>;

  beforeEach(() => {
    jest.resetAllMocks();
    apiClient = {
      search: jest.fn(),
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
