import {updateFacetOptions} from '../../../../../features/facet-options/facet-options-actions.js';
import {deselectAllFacetValues} from '../../../../../features/facets/facet-set/facet-set-actions.js';
import * as dateFacetActions from '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions.js';
import {executeToggleDateFacetSelect} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-controller-actions.js';
import type {DateFacetValue} from '../../../../../features/facets/range-facets/date-facet-set/interfaces/response.js';
import {updateRangeFacetSortCriterion} from '../../../../../features/facets/range-facets/generic/range-facet-actions.js';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions.js';
import type {InsightAppState} from '../../../../../state/insight-app-state.js';
import {buildMockDateFacetSlice} from '../../../../../test/mock-date-facet-slice.js';
import {buildMockDateFacetValue} from '../../../../../test/mock-date-facet-value.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../../../test/mock-insight-state.js';
import {
  buildDateFacet,
  type DateFacet,
  type DateFacetOptions,
} from './headless-insight-date-facet.js';

vi.mock(
  '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions'
);
vi.mock('../../../../../features/facet-options/facet-options-actions');
vi.mock('../../../../../features/insight-search/insight-search-actions');
vi.mock(
  '../../../../../features/facets/range-facets/date-facet-set/date-facet-controller-actions'
);
vi.mock('../../../../../features/facets/facet-set/facet-set-actions');
vi.mock(
  '../../../../../features/facets/range-facets/generic/range-facet-actions'
);

describe('insight date facet', () => {
  const facetId = '1';
  let options: DateFacetOptions;
  let state: InsightAppState;
  let engine: MockedInsightEngine;
  let dateFacet: DateFacet;

  function initDateFacet() {
    engine = buildMockInsightEngine(state);
    dateFacet = buildDateFacet(engine, {options});
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'created',
      generateAutomaticRanges: true,
    };

    state = buildMockInsightState();
    state.dateFacetSet[facetId] = buildMockDateFacetSlice();

    initDateFacet();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('#toggleSelect', () => {
    it('dispatches a executeToggleDateFacetSelect with the passed value', () => {
      const value = buildMockDateFacetValue();
      dateFacet.toggleSelect(value);
      expect(executeToggleDateFacetSelect).toHaveBeenCalledWith({
        facetId,
        selection: value,
      });
    });

    it('dispatches a search', () => {
      const value = buildMockDateFacetValue();
      dateFacet.toggleSelect(value);

      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#deselectAll', () => {
    beforeEach(() => dateFacet.deselectAll());

    it('dispatches #deselectAllFacetValues with the facet id', () => {
      expect(deselectAllFacetValues).toHaveBeenCalledWith(facetId);
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      expect(updateFacetOptions).toHaveBeenCalled();
    });

    it('dispatches a search', () => {
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#sortBy', () => {
    it('dispatches #updateRangeFacetSortCriterion', () => {
      const criterion = 'descending';
      dateFacet.sortBy(criterion);
      expect(updateRangeFacetSortCriterion).toHaveBeenCalledWith({
        facetId,
        criterion,
      });
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      dateFacet.sortBy('descending');
      expect(updateFacetOptions).toHaveBeenCalled();
    });

    it('dispatches a search', () => {
      dateFacet.sortBy('descending');
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  function testCommonToggleSingleSelect(facetValue: () => DateFacetValue) {
    it('dispatches a #toggleSelect action with the passed facet value', () => {
      dateFacet.toggleSingleSelect(facetValue());
      expect(executeToggleDateFacetSelect).toHaveBeenCalledWith({
        facetId,
        selection: facetValue(),
      });
    });

    it('dispatches a search', () => {
      dateFacet.toggleSingleSelect(facetValue());
      expect(executeSearch).toHaveBeenCalled();
    });
  }

  describe('#toggleSingleSelect when the value state is "idle"', () => {
    const facetValue = () => buildMockDateFacetValue({state: 'idle'});

    testCommonToggleSingleSelect(facetValue);

    it('dispatches a #deselectAllFacetValues action', () => {
      dateFacet.toggleSingleSelect(facetValue());
      expect(deselectAllFacetValues).toHaveBeenCalledWith(facetId);
    });
  });

  describe('#toggleSingleSelect when the value state is not "idle"', () => {
    const facetValue = () => buildMockDateFacetValue({state: 'selected'});

    testCommonToggleSingleSelect(facetValue);

    it('does not dispatch a #deselectAllFacetValues action', () => {
      const spy = vi.spyOn(dateFacetActions, 'deselectAllDateFacetValues');
      dateFacet.toggleSingleSelect(facetValue());
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
