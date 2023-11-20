import {buildMockSearchAppEngine, MockSearchEngine} from '../../../test';
import {createMockState} from '../../../test/mock-state';
import {logSearchboxSubmit} from '../../query/query-analytics-actions';
import {buildSearchRequest} from '../search-request';
import {
  executeSearch,
  fetchInstantResults,
  buildInstantResultSearchRequest,
  fetchFacetValues,
  fetchPage,
  fetchMoreResults,
} from './search-actions';

describe('search actions', () => {
  let e: MockSearchEngine;

  beforeEach(() => {
    e = buildMockSearchAppEngine({state: createMockState()});
    jest.spyOn(e.apiClient, 'search');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('the search request "origin"', () => {
    it('with #executeSearch', async () => {
      await e.dispatch(executeSearch(logSearchboxSubmit()));
      const req = (await buildSearchRequest(e.state)).request;
      expect(e.apiClient.search).toHaveBeenCalledWith(
        req,
        expect.objectContaining({
          origin: 'mainSearch',
        })
      );
    });

    it('with #fetchPage', async () => {
      await e.dispatch(fetchPage(logSearchboxSubmit()));
      const req = (await buildSearchRequest(e.state)).request;
      expect(e.apiClient.search).toHaveBeenCalledWith(
        req,
        expect.objectContaining({
          origin: 'mainSearch',
        })
      );
    });

    it('with #fetchMoreResults', async () => {
      await e.dispatch(fetchMoreResults());
      const req = (await buildSearchRequest(e.state)).request;
      expect(e.apiClient.search).toHaveBeenCalledWith(
        req,
        expect.objectContaining({
          origin: 'mainSearch',
        })
      );
    });

    it('with #fetchInstantResults', async () => {
      const q = 'test';
      const numberOfResults = 10;
      await e.dispatch(
        fetchInstantResults({
          q,
          maxResultsPerQuery: numberOfResults,
          id: 'some-id',
        })
      );
      const req = (
        await buildInstantResultSearchRequest(e.state, q, numberOfResults)
      ).request;
      expect(e.apiClient.search).toHaveBeenCalledWith(
        req,
        expect.objectContaining({
          origin: 'instantResults',
          disableAbortWarning: true,
        })
      );
    });

    it('with #fetchFacetValues', async () => {
      await e.dispatch(fetchFacetValues(logSearchboxSubmit()));
      const req = (await buildSearchRequest(e.state)).request;
      req.numberOfResults = 0;
      expect(e.apiClient.search).toHaveBeenCalledWith(
        req,
        expect.objectContaining({
          origin: 'facetValues',
        })
      );
    });
  });
});
