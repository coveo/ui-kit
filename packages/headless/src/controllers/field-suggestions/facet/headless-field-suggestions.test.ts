import {SearchAppState} from '../../..';
import {FacetRequest} from '../../../features/facets/facet-set/interfaces/request';
import {
  buildMockSearchAppEngine,
  createMockState,
  MockSearchEngine,
} from '../../../test';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {buildMockFacetSearch} from '../../../test/mock-facet-search';
import {
  buildFieldSuggestions,
  FieldSuggestions,
  FieldSuggestionsOptions,
} from './headless-field-suggestions';
import {updateFacetSearch} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {executeFacetSearch} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions';

describe('fieldSuggestions', () => {
  const facetId = 'id';
  let state: SearchAppState;
  let engine: MockSearchEngine;
  let fieldSuggestions: FieldSuggestions;
  let options: FieldSuggestionsOptions;

  function initFacet() {
    engine = buildMockSearchAppEngine({state});
    fieldSuggestions = buildFieldSuggestions(engine, {options});
  }

  function setFacetRequest(config: Partial<FacetRequest> = {}) {
    state.facetSet[facetId] = buildMockFacetRequest({facetId, ...config});
    state.facetSearchSet[facetId] = buildMockFacetSearch({
      initialNumberOfValues: 5,
    });
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'author',
    };

    state = createMockState();
    setFacetRequest();

    initFacet();
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
