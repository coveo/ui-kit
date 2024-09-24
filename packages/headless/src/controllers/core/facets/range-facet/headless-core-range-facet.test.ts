import {CoreEngine} from '../../../../app/engine.js';
import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions.js';
import {deselectAllFacetValues} from '../../../../features/facets/facet-set/facet-set-actions.js';
import {updateRangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/range-facet-actions.js';
import {NumericFacetRequest} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/request.js';
import {SearchAppState} from '../../../../state/search-app-state.js';
import {
  ConfigurationSection,
  FacetOptionsSection,
  SearchSection,
} from '../../../../state/state-sections.js';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../../../test/mock-engine-v2.js';
import {buildMockNumericFacetRequest} from '../../../../test/mock-numeric-facet-request.js';
import {buildMockNumericFacetResponse} from '../../../../test/mock-numeric-facet-response.js';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value.js';
import {createMockState} from '../../../../test/mock-state.js';
import {
  buildCoreRangeFacet,
  RangeFacet,
  RangeFacetProps,
} from './headless-core-range-facet.js';

vi.mock('../../../../features/facet-options/facet-options-actions');
vi.mock('../../../../features/facets/facet-set/facet-set-actions');
vi.mock('../../../../features/facets/range-facets/generic/range-facet-actions');

describe('range facet', () => {
  const facetId = '1';
  let state: SearchAppState;
  let engine: MockedSearchEngine;
  let props: RangeFacetProps<NumericFacetRequest>;
  let rangeFacet: RangeFacet;

  function initRangeFacet() {
    engine = buildMockSearchEngine(state);
    rangeFacet = buildCoreRangeFacet(
      engine as CoreEngine<
        ConfigurationSection & SearchSection & FacetOptionsSection
      >,
      props
    );
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

  it('#state.facetId exposes the facet id', () => {
    expect(rangeFacet.state.facetId).toBe(facetId);
  });

  it('#state.values holds the response values', () => {
    const values = [buildMockNumericFacetValue()];
    const facet = buildMockNumericFacetResponse({facetId, values});
    state.search.response.facets = [facet];
    initRangeFacet();

    expect(rangeFacet.state.values).toEqual(values);
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
      expect(deselectAllFacetValues).toHaveBeenCalledWith(facetId);
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      expect(updateFacetOptions).toHaveBeenCalled();
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
      expect(updateRangeFacetSortCriterion).toHaveBeenCalledWith({
        facetId,
        criterion,
      });
    });

    it('dispatches #updateFacetOptions', () => {
      rangeFacet.sortBy('descending');
      expect(updateFacetOptions).toHaveBeenCalled();
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
