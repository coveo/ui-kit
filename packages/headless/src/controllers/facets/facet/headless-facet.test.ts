import {Facet, FacetOptions} from './headless-facet';
import {MockEngine, buildMockEngine} from '../../../test/mock-engine';
import {
  registerFacet,
  toggleSelectFacetValue,
  deselectAllFacetValues,
  updateFacetSortCriterion,
} from '../../../features/facets/facet-set/facet-set-actions';
import {SearchPageState} from '../../../state';
import {createMockState} from '../../../test/mock-state';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {buildMockFacetValue} from '../../../test/mock-facet-value';
import {executeSearch} from '../../../features/search/search-actions';
import {FacetRequest} from '../../../features/facets/facet-set/facet-set-interfaces';
import {buildFacetRequest} from '../../../features/facets/facet-set/facet-set-slice';

describe('facet', () => {
  let options: Required<FacetOptions>;
  let state: SearchPageState;
  let engine: MockEngine;
  let facet: Facet;

  function initEngine() {
    engine = buildMockEngine({state});
  }

  function initFacet() {
    facet = new Facet(engine, {options});
  }

  function setFacetRequest(config: Partial<FacetRequest> = {}) {
    const facetId = options.facetId;
    const request = buildFacetRequest({facetId, ...config});
    state.facetSet[facetId] = request;
  }

  beforeEach(() => {
    options = {
      facetId: '',
      field: '',
      sortCriteria: 'score',
    };

    state = createMockState();
    setFacetRequest();

    initEngine();
    initFacet();
  });

  it('renders', () => {
    expect(facet).toBeTruthy();
  });

  it('registers a facet with the passed id and field', () => {
    options = {
      facetId: '1',
      field: 'author',
      sortCriteria: 'alphanumeric',
    };
    initFacet();

    const action = registerFacet(options);

    expect(engine.actions).toContainEqual(action);
  });

  it('when the search response is empty, the facet #state.values is an empty array', () => {
    expect(state.search.response.facets).toEqual([]);
    expect(facet.state.values).toEqual([]);
  });

  it('when the search response has a facet, the facet #state.values contains the same values', () => {
    const values = [buildMockFacetValue()];
    const facetResponse = buildMockFacetResponse({
      facetId: options.facetId,
      values,
    });

    state.search.response.facets = [facetResponse];
    expect(facet.state.values).toBe(values);
  });

  it('#toggleSelect dispatches a toggleSelect action with the passed facet value', () => {
    const facetValue = buildMockFacetValue({value: 'TED'});
    facet.toggleSelect(facetValue);

    expect(engine.actions).toContainEqual(
      toggleSelectFacetValue({facetId: options.facetId, selection: facetValue})
    );
  });

  it('#toggleSelect dispatches a search', () => {
    const facetValue = buildMockFacetValue({value: 'TED'});
    facet.toggleSelect(facetValue);

    const action = engine.actions.find(
      (a) => a.type === executeSearch.pending.type
    );
    expect(action).toBeTruthy();
  });

  it('#isValueSelected returns true when the passed value is selected', () => {
    const facetValue = buildMockFacetValue({state: 'selected'});
    expect(facet.isValueSelected(facetValue)).toBe(true);
  });

  it('#isValueSelected returns false when the passed value is not selected (e.g. idle)', () => {
    const facetValue = buildMockFacetValue({state: 'idle'});
    expect(facet.isValueSelected(facetValue)).toBe(false);
  });

  it('#deselectAll dispatches a deselectAllFacetValues action with the facet id', () => {
    facet.deselectAll();
    expect(engine.actions).toContainEqual(
      deselectAllFacetValues(options.facetId)
    );
  });

  it('#deselectAll dispatches a search', () => {
    facet.deselectAll();

    const action = engine.actions.find(
      (a) => a.type === executeSearch.pending.type
    );
    expect(engine.actions).toContainEqual(action);
  });

  it('when #state.values has a value with a non-idle state, #hasActiveValues returns true', () => {
    const facetResponse = buildMockFacetResponse({facetId: options.facetId});
    facetResponse.values = [buildMockFacetValue({state: 'selected'})];
    state.search.response.facets = [facetResponse];

    expect(facet.hasActiveValues).toBe(true);
  });

  it('when #state.values only has idle values, #hasActiveValues returns false', () => {
    const facetResponse = buildMockFacetResponse({facetId: options.facetId});
    facetResponse.values = [buildMockFacetValue({state: 'idle'})];
    state.search.response.facets = [facetResponse];

    expect(facet.hasActiveValues).toBe(false);
  });

  it('#sortBy dispatches a #updateFacetSortCriterion action with the passed value', () => {
    const criterion = 'score';
    facet.sortBy(criterion);

    const action = updateFacetSortCriterion({
      facetId: options.facetId,
      criterion,
    });

    expect(engine.actions).toContainEqual(action);
  });

  it('#sortBy dispatches a search', () => {
    facet.sortBy('score');
    const action = engine.actions.find(
      (a) => a.type === executeSearch.pending.type
    );

    expect(engine.actions).toContainEqual(action);
  });

  it('when the passed criterion matches the active sort criterion, #isSortedBy returns true', () => {
    const criterion = 'score';
    setFacetRequest({sortCriteria: criterion});

    expect(facet.isSortedBy(criterion)).toBe(true);
  });

  it('when the passed criterion does not match the active sort criterion, #isSortedBy returns false', () => {
    setFacetRequest({sortCriteria: 'alphanumeric'});

    expect(facet.isSortedBy('score')).toBe(false);
  });
});
