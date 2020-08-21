import {
  FacetSearchOptions,
  registerFacetSearch,
  updateFacetSearch,
  executeFacetSearch,
} from './facet-search-actions';
import {
  FacetSearchSetState,
  facetSearchSetReducer,
  getFacetSearchSetInitialState,
  buildFacetSearchState,
  buildFacetSearchOptions,
} from './facet-search-set-slice';
import {buildMockFacetSearchResponse} from '../../../test/mock-facet-search-response';
import {buildMockFacetSearchResult} from '../../../test/mock-facet-search-result';

describe('FacetSearch slice', () => {
  const facetId = '1';

  let state: FacetSearchSetState;

  beforeEach(() => {
    state = getFacetSearchSetInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = facetSearchSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  describe('registration', () => {
    const facetId = '1';
    const options: FacetSearchOptions = {facetId};

    beforeEach(() => {
      state = facetSearchSetReducer(state, registerFacetSearch(options));
    });

    it('registers a facet search with the passed id and options', () => {
      expect(state[facetId].options).toEqual({
        facetId,
        captions: {},
        numberOfValues: 10,
        query: '',
      });
    });

    it('the initial isLoading state is set to false', () => {
      expect(state[facetId].isLoading).toBe(false);
    });
  });

  it('registering a facet search with an id that already exists does not overwrite the existing facet', () => {
    const facetId = '1';
    state[facetId] = buildFacetSearchState();

    const options = buildFacetSearchOptions({numberOfValues: 5});
    const finalState = facetSearchSetReducer(
      state,
      registerFacetSearch({facetId, ...options})
    );

    expect(finalState[facetId].options).not.toEqual(options);
  });

  it('when passing an id that is registered, #updateFacetSearch updates the options', () => {
    state[facetId] = buildFacetSearchState();

    const options = buildFacetSearchOptions();
    const finalState = facetSearchSetReducer(
      state,
      updateFacetSearch({facetId, ...options})
    );

    expect(finalState[facetId].options).toEqual(options);
  });

  it('when passing an id that is not registered, #updateFacetSearch does not register the options', () => {
    const facetId = '1';
    const options = buildFacetSearchOptions();
    const finalState = facetSearchSetReducer(
      state,
      updateFacetSearch({facetId, ...options})
    );

    expect(finalState[facetId]).toBe(undefined);
  });

  describe('#executeFacetSearch', () => {
    const facetId = '1';

    it('on #executeFacetSearch.fulfilled with a registered id, it updates the facetSearch response', () => {
      state[facetId] = buildFacetSearchState();

      const values = [buildMockFacetSearchResult()];
      const response = buildMockFacetSearchResponse({values});
      const action = executeFacetSearch.fulfilled({facetId, response}, '', '');

      const finalState = facetSearchSetReducer(state, action);
      expect(finalState[facetId].response).toEqual(response);
    });

    it('on #executeFacetSearch.fulfilled with an unregistered id, it does nothing', () => {
      const response = buildMockFacetSearchResponse();
      const action = executeFacetSearch.fulfilled({facetId, response}, '', '');

      const finalState = facetSearchSetReducer(state, action);
      expect(finalState[facetId]).toBe(undefined);
    });

    it('on #executeFacetSearch.pending with an unregistered id, it does nothing', () => {
      const pendingAction = executeFacetSearch.pending(facetId, facetId);

      const finalState = facetSearchSetReducer(state, pendingAction);
      expect(finalState[facetId]).toBe(undefined);
    });

    it('on #executeFacetSearch.rejected with an unregistered id, it does nothing', () => {
      const rejectedAction = executeFacetSearch.rejected(
        {name: 'test', message: 'test'},
        facetId,
        facetId
      );

      const finalState = facetSearchSetReducer(state, rejectedAction);
      expect(finalState[facetId]).toBe(undefined);
    });

    it('sets the isLoading state to false during executeSearch.fulfilled', () => {
      state[facetId] = buildFacetSearchState();

      const fulfiledAction = executeFacetSearch.fulfilled(
        {
          facetId,
          response: buildMockFacetSearchResponse(),
        },
        facetId,
        facetId
      );
      const finalState = facetSearchSetReducer(state, fulfiledAction);
      expect(finalState[facetId].isLoading).toBe(false);
    });

    it('sets the isLoading state to true during executeSearch.pending', () => {
      state[facetId] = buildFacetSearchState();

      const pendingAction = executeFacetSearch.pending(facetId, facetId);
      const finalState = facetSearchSetReducer(state, pendingAction);
      expect(finalState[facetId].isLoading).toBe(true);
    });

    it('sets the isLoading state to false during executeSearch.rejected', () => {
      state[facetId] = buildFacetSearchState();

      const rejectedAction = executeFacetSearch.rejected(
        {name: 'test', message: 'test'},
        facetId,
        facetId
      );
      const finalState = facetSearchSetReducer(state, rejectedAction);
      expect(finalState[facetId].isLoading).toBe(false);
    });
  });
});
