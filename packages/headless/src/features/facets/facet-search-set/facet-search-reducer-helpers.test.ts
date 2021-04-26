import {
  handleFacetSearchRegistration,
  handleFacetSearchUpdate,
  handleFacetSearchPending,
  handleFacetSearchRejected,
  handleFacetSearchFulfilled,
  handleFacetSearchClear,
  handleFacetSearchSetClear,
  defaultFacetSearchOptions,
} from './facet-search-reducer-helpers';
import {buildMockFacetSearchResponse} from '../../../test/mock-facet-search-response';
import {buildMockFacetSearchResult} from '../../../test/mock-facet-search-result';
import {buildMockFacetSearch} from '../../../test/mock-facet-search';
import {buildMockFacetSearchRequestOptions} from '../../../test/mock-facet-search-request-options';
import {SpecificFacetSearchResponse} from '../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {
  SpecificFacetSearchSetState,
  getFacetSearchSetInitialState,
} from './specific/specific-facet-search-set-state';

describe('FacetSearch slice', () => {
  const buildEmptyResponse = (): SpecificFacetSearchResponse => ({
    moreValuesAvailable: false,
    values: [],
  });
  const facetId = '1';
  let state: SpecificFacetSearchSetState;

  beforeEach(() => {
    state = getFacetSearchSetInitialState();
  });

  describe('#handleFacetSearchRegistration', () => {
    it('when the id is unregistered, it registers a facet search with the passed id and options', () => {
      handleFacetSearchRegistration(state, {facetId}, buildEmptyResponse);
      expect(state[facetId].options).toEqual({
        ...buildMockFacetSearch().options,
        facetId,
      });
    });

    it('when the id is unregistered, the registered facet search initial isLoading state is set to false', () => {
      handleFacetSearchRegistration(state, {facetId}, buildEmptyResponse);
      expect(state[facetId].isLoading).toBe(false);
    });

    it('when the id already exists, it does not overwrite the existing facet', () => {
      state[facetId] = buildMockFacetSearch();
      const options = buildMockFacetSearchRequestOptions({
        numberOfValues: 5,
      });

      handleFacetSearchRegistration(
        state,
        {facetId, ...options},
        buildEmptyResponse
      );
      expect(state[facetId].options).not.toEqual(options);
    });
  });

  describe('#handleFacetSearchUpdate', () => {
    it('when passing an id that is registered, #updateFacetSearch updates the options', () => {
      state[facetId] = buildMockFacetSearch();

      const options = buildMockFacetSearchRequestOptions();
      handleFacetSearchUpdate(state, {facetId, ...options});

      expect(state[facetId].options).toEqual(options);
    });

    it('when passing an id that is not registered, #updateFacetSearch does not register the options', () => {
      const options = buildMockFacetSearchRequestOptions();
      handleFacetSearchUpdate(state, {facetId, ...options});

      expect(state[facetId]).toBe(undefined);
    });
  });

  describe('#handleFacetSearchPending', () => {
    it('when the id is unregistered, it does nothing', () => {
      handleFacetSearchPending(state, facetId);
      expect(state[facetId]).toBe(undefined);
    });

    it('when the id is registered, it sets the isLoading state to true', () => {
      state[facetId] = buildMockFacetSearch();

      handleFacetSearchPending(state, facetId);
      expect(state[facetId].isLoading).toBe(true);
    });
  });

  describe('#handleFacetSearchRejected', () => {
    it('when the id is unregistered, it does nothing', () => {
      handleFacetSearchRejected(state, facetId);
      expect(state[facetId]).toBe(undefined);
    });

    it('when the id is registered, it sets the isLoading to false', () => {
      state[facetId] = buildMockFacetSearch({isLoading: true});
      handleFacetSearchRejected(state, facetId);
      expect(state[facetId].isLoading).toBe(false);
    });
  });

  describe('#handleFacetSearchFulfilled', () => {
    it('when the id is registered, it updates the facetSearch response', () => {
      state[facetId] = buildMockFacetSearch();

      const values = [buildMockFacetSearchResult()];
      const response = buildMockFacetSearchResponse({values});

      handleFacetSearchFulfilled(state, {facetId, response});
      expect(state[facetId].response).toEqual(response);
    });

    it('when the id is registered, it sets isLoading state to false', () => {
      state[facetId] = buildMockFacetSearch({isLoading: true});
      const response = buildMockFacetSearchResponse();

      handleFacetSearchFulfilled(state, {facetId, response});
      expect(state[facetId].isLoading).toBe(false);
    });

    it('when the id is unregistered, it does nothing', () => {
      const response = buildMockFacetSearchResponse();
      handleFacetSearchFulfilled(state, {facetId, response});
      expect(state[facetId]).toBe(undefined);
    });
  });

  describe('#handleFacetSearchClearResults', () => {
    it('when the id is registered, it updates the facetSearch response to an empty response', () => {
      state[facetId] = buildMockFacetSearch();
      handleFacetSearchClear(state, {facetId}, buildEmptyResponse);
      expect(state[facetId].response).toEqual(buildEmptyResponse());
    });

    it('when the id is registered, it sets isLoading state to false', () => {
      state[facetId] = buildMockFacetSearch({isLoading: true});

      handleFacetSearchClear(state, {facetId}, buildEmptyResponse);
      expect(state[facetId].isLoading).toBe(false);
    });

    it('when the id is registered, it resets the query', () => {
      state[facetId] = buildMockFacetSearch({
        options: buildMockFacetSearchRequestOptions({query: '*hello*'}),
      });

      handleFacetSearchClear(state, {facetId}, buildEmptyResponse);
      expect(state[facetId].options.query).toBe(
        defaultFacetSearchOptions.query
      );
    });

    it('when the id is unregistered, it does nothing', () => {
      handleFacetSearchClear(state, {facetId}, buildEmptyResponse);
      expect(state[facetId]).toBe(undefined);
    });
  });

  describe('#handleFacetSearchSetClearResults', () => {
    it('it updates all facetSearch responses to an empty response', () => {
      const anotherFacetId = '2';
      state[facetId] = buildMockFacetSearch();
      state[anotherFacetId] = buildMockFacetSearch();
      handleFacetSearchSetClear(state, buildEmptyResponse);

      expect(state[facetId].response).toEqual(buildEmptyResponse());
      expect(state[anotherFacetId].response).toEqual(buildEmptyResponse());
    });
  });
});
