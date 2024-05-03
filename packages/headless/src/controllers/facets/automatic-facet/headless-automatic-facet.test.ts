import {buildAutomaticFacet} from '../../../controllers/facets/automatic-facet/headless-automatic-facet';
import {
  deselectAllAutomaticFacetValues,
  toggleSelectAutomaticFacetValue,
} from '../../../features/facets/automatic-facet-set/automatic-facet-set-actions';
import {executeSearch} from '../../../features/search/search-actions';
import {SearchAppState} from '../../../state/search-app-state';
import {buildMockAutomaticFacetSlice} from '../../../test/mock-automatic-facet-slice';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../test/mock-engine-v2';
import {buildMockFacetValue} from '../../../test/mock-facet-value';
import {createMockState} from '../../../test/mock-state';
import {AutomaticFacet} from '../automatic-facet-generator/headless-automatic-facet-generator';

jest.mock(
  '../../../features/facets/automatic-facet-set/automatic-facet-set-actions'
);
jest.mock('../../../features/search/search-actions');

describe('automatic facet', () => {
  const field = 'field';
  const badField = 'badField';
  let state: SearchAppState;
  let engine: MockedSearchEngine;
  let facet: AutomaticFacet;
  let emptyFacet: AutomaticFacet;

  function initFacet() {
    engine = buildMockSearchEngine(state);
    facet = buildAutomaticFacet(engine, {field});
    emptyFacet = buildAutomaticFacet(engine, {field: badField});
  }

  function setAutomaticFacet() {
    state.automaticFacetSet.set[field] = buildMockAutomaticFacetSlice();
  }

  beforeEach(() => {
    state = createMockState();
    setAutomaticFacet();

    initFacet();
  });

  it('renders', () => {
    expect(facet).toBeTruthy();
  });

  it('exposes a #subscribe method', () => {
    expect(facet.subscribe).toBeTruthy();
  });

  it('when the response is empty, the facet #state.values is an empty array', () => {
    expect(emptyFacet.state.values).toEqual([]);
  });

  it('when the response is empty, the facet #state.field is an empty string', () => {
    expect(emptyFacet.state.field).toEqual('');
  });

  it('when the response is empty, the facet #state.label is an empty string', () => {
    expect(emptyFacet.state.label).toEqual('');
  });

  describe('#toggleSelect', () => {
    it('dispatches a #toggleSelectAutomaticFacetValue with the passed facet value', () => {
      const facetValue = buildMockFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);
      expect(toggleSelectAutomaticFacetValue).toHaveBeenCalledWith({
        field,
        selection: facetValue,
      });
    });

    it('dispatches a #executeSearch', () => {
      const facetValue = buildMockFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#deselectAll', () => {
    it('dispatches a #deselectAllAutomaticFacetValues with the passed field', () => {
      facet.deselectAll();
      expect(deselectAllAutomaticFacetValues).toHaveBeenCalledWith(field);
    });

    it('dispatches a #executeSearch ', () => {
      facet.deselectAll();
      expect(executeSearch).toHaveBeenCalled();
    });
  });
});
