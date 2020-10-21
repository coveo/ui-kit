import {MockEngine, buildMockEngine} from '../../../test/mock-engine';
import {createMockState} from '../../../test/mock-state';
import {executeSearch} from '../../../features/search/search-actions';
import {buildMockNumericFacetValue} from '../../../test/mock-numeric-facet-value';
import {buildMockNumericFacetResponse} from '../../../test/mock-numeric-facet-response';
import {
  buildRangeFacet,
  RangeFacet,
  RangeFacetProps,
} from './headless-range-facet';
import {updateRangeFacetSortCriterion} from '../../../features/facets/range-facets/generic/range-facet-actions';
import {NumericFacetRequest} from '../../../features/facets/range-facets/numeric-facet-set/interfaces/request';
import {buildMockNumericFacetRequest} from '../../../test/mock-numeric-facet-request';
import {deselectAllFacetValues} from '../../../features/facets/facet-set/facet-set-actions';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {SearchAppState} from '../../../state/search-app-state';

describe('range facet', () => {
  const facetId = '1';
  let state: SearchAppState;
  let engine: MockEngine;
  let props: RangeFacetProps<NumericFacetRequest>;
  let rangeFacet: RangeFacet;

  function initRangeFacet() {
    engine = buildMockEngine({state});
    rangeFacet = buildRangeFacet(engine, props);
  }

  beforeEach(() => {
    props = {
      facetId,
      getRequest: () => buildMockNumericFacetRequest(),
    };

    state = createMockState();
    initRangeFacet();
  });

  it('is subscribable', () => {
    expect(rangeFacet.subscribe).toBeDefined();
  });

  it('#state.values holds the response values', () => {
    const values = [buildMockNumericFacetValue()];
    const facet = buildMockNumericFacetResponse({facetId, values});
    state.search.response.facets = [facet];
    initRangeFacet();

    expect(rangeFacet.state.values).toEqual(values);
  });

  describe('#toggleSelect', () => {
    beforeEach(() => {
      const value = buildMockNumericFacetValue();
      rangeFacet.toggleSelect(value);
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('dispatches a search', () => {
      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  it('when the value is selected, #isValueSelected returns `true`', () => {
    const value = buildMockNumericFacetValue({state: 'selected'});
    expect(rangeFacet.isValueSelected(value)).toBe(true);
  });

  it('when the value is not selected, #isValueSelected returns `false`', () => {
    const value = buildMockNumericFacetValue({state: 'idle'});
    expect(rangeFacet.isValueSelected(value)).toBe(false);
  });

  describe('#deselectAll', () => {
    beforeEach(() => rangeFacet.deselectAll());

    it('dispatches #deselectAllFacetValues with the facet id', () => {
      expect(engine.actions).toContainEqual(deselectAllFacetValues(facetId));
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('dispatches a search', () => {
      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );

      expect(engine.actions).toContainEqual(action);
    });
  });

  describe('#state.hasActiveValues', () => {
    it('when #state.values has a value with a non-idle state, it returns true', () => {
      const values = [buildMockNumericFacetValue({state: 'selected'})];
      const response = buildMockNumericFacetResponse({facetId, values});
      state.search.response.facets = [response];

      expect(rangeFacet.state.hasActiveValues).toBe(true);
    });

    it('when #state.values only has idle values, it returns false', () => {
      const values = [buildMockNumericFacetValue({state: 'idle'})];
      const response = buildMockNumericFacetResponse({facetId, values});
      state.search.response.facets = [response];

      expect(rangeFacet.state.hasActiveValues).toBe(false);
    });
  });

  describe('#sortBy', () => {
    it('dispatches #updateRangeFacetSortCriterion', () => {
      const criterion = 'descending';
      rangeFacet.sortBy(criterion);
      const action = updateRangeFacetSortCriterion({facetId, criterion});

      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      rangeFacet.sortBy('descending');

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('dispatches a search', () => {
      rangeFacet.sortBy('descending');

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  describe('#isSortedBy', () => {
    it('when the passed criterion matches the active sort criterion, it returns true', () => {
      const criterion = 'descending';
      props.getRequest = () =>
        buildMockNumericFacetRequest({sortCriteria: criterion});
      initRangeFacet();

      expect(rangeFacet.isSortedBy(criterion)).toBe(true);
    });

    it('when the passed criterion does not match the active sort criterion, it returns false', () => {
      const criterion = 'descending';
      props.getRequest = () =>
        buildMockNumericFacetRequest({sortCriteria: 'ascending'});
      initRangeFacet();

      expect(rangeFacet.isSortedBy(criterion)).toBe(false);
    });
  });
});
