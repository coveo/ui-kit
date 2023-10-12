import {SearchAppState} from '../../../index.js';
import {executeFacetSearch} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions.js';
import {updateFacetSearch} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions.js';
import {registerFacet} from '../../../features/facets/facet-set/facet-set-actions.js';
import {defaultFacetOptions} from '../../../features/facets/facet-set/facet-set-slice.js';
import {FacetRequest} from '../../../features/facets/facet-set/interfaces/request.js';
import {
  buildMockSearchAppEngine,
  createMockState,
  MockSearchEngine,
} from '../../../test.js';
import {buildMockFacetRequest} from '../../../test/mock-facet-request.js';
import {buildMockFacetSearch} from '../../../test/mock-facet-search.js';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice.js';
import {
  buildFieldSuggestions,
  FieldSuggestions,
  FieldSuggestionsOptions,
} from './headless-field-suggestions.js';

describe('fieldSuggestions', () => {
  const field = 'author';
  const facetId = 'test';
  let state: SearchAppState;
  let engine: MockSearchEngine;
  let fieldSuggestions: FieldSuggestions;
  let options: FieldSuggestionsOptions;

  function initFacet() {
    engine = buildMockSearchAppEngine({state});
    fieldSuggestions = buildFieldSuggestions(engine, {options});
  }

  function setFacetRequest(config: Partial<FacetRequest> = {}) {
    state.facetSet[facetId] = buildMockFacetSlice({
      request: buildMockFacetRequest({facetId, ...config}),
    });
    state.facetSearchSet[facetId] = buildMockFacetSearch({
      initialNumberOfValues: 5,
    });
  }

  beforeEach(() => {
    options = {
      facet: {
        facetId,
        field: 'author',
      },
    };

    state = createMockState();
    setFacetRequest();

    initFacet();
  });

  it('should dispatch an #registerFacet action when initialized', () => {
    expect(engine.actions).toEqual(
      expect.arrayContaining([
        <ReturnType<typeof registerFacet>>{
          type: registerFacet.type,
          payload: {
            ...defaultFacetOptions,
            facetId,
            field,
          },
        },
      ])
    );
  });

  it('should dispatch an #updateFacetSearch and #executeFacetSearch action on #updateText', () => {
    fieldSuggestions.updateText('foo');
    expect(
      engine.actions.find((act) => act.type === updateFacetSearch.type)
    ).toBeDefined();
    expect(
      engine.actions.find((act) => act.type === executeFacetSearch.pending.type)
    ).toBeDefined();
  });
});
