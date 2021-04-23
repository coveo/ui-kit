import {
  handleFacetSearchRegistration,
  handleFacetSearchUpdate,
  handleFacetSearchPending,
  handleFacetSearchRejected,
  handleFacetSearchFulfilled,
} from './facet-search-reducer-helpers';
import {buildMockFacetSearchResponse} from '../../../test/mock-facet-search-response';
import {buildMockFacetSearchResult} from '../../../test/mock-facet-search-result';
import {buildMockFacetSearch} from '../../../test/mock-facet-search';
import {buildMockFacetSearchStateOptions} from '../../../test/mock-facet-search-state-options';
import {SpecificFacetSearchResponse} from '../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {
  SpecificFacetSearchSetState,
  getFacetSearchSetInitialState,
} from './specific/specific-facet-search-set-state';

describe('FacetSearch slice', () => {
  const facetId = '1';
  let state: SpecificFacetSearchSetState;

  beforeEach(() => {
    state = getFacetSearchSetInitialState();
  });

  describe('#handleFacetSearchRegistration', () => {
    const buildEmptyResponse = (): SpecificFacetSearchResponse => ({
      moreValuesAvailable: false,
      values: [],
    });

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
      const options = buildMockFacetSearchStateOptions({
        numberOfValues: 5,
        initialNumberOfValues: 5,
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

      const options = buildMockFacetSearchStateOptions();
      handleFacetSearchUpdate(state, {facetId, ...options});

      expect(state[facetId].options).toEqual(options);
    });

    it('when passing an id that is not registered, #updateFacetSearch does not register the options', () => {
      const options = buildMockFacetSearchStateOptions();
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
});

// TODO: add tests
describe.skip('#handleFacetSearchClearResults', () => {});
describe.skip('#handleFacetSearchSetClearResults', () => {});
