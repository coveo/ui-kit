import type {Mock} from 'vitest';
import {updateFacetOptions} from '../../../../../features/facet-options/facet-options-actions.js';
import {updateDateFacetValues} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions.js';
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
  buildDateFilter,
  type DateFilter,
  type DateFilterInitialState,
  type DateFilterOptions,
} from './headless-insight-date-filter.js';

vi.mock(
  '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions'
);
vi.mock('../../../../../features/facet-options/facet-options-actions');
vi.mock('../../../../../features/insight-search/insight-search-actions');

describe('insight date filter', () => {
  const facetId = '1';
  let options: DateFilterOptions;
  let initialState: DateFilterInitialState | undefined;
  let state: InsightAppState;
  let engine: MockedInsightEngine;
  let dateFacet: DateFilter;

  function initDateFilter() {
    engine = buildMockInsightEngine(state);
    dateFacet = buildDateFilter(engine, {options, initialState});
  }

  beforeEach(() => {
    (updateDateFacetValues as unknown as Mock).mockReturnValue(() => {});
    initialState = undefined;

    options = {
      facetId,
      field: 'created',
    };

    state = buildMockInsightState();
    state.dateFacetSet[facetId] = buildMockDateFacetSlice();

    initDateFilter();
  });

  describe('#setRange', () => {
    it('dispatches a updateDateFacetValues with the passed value', () => {
      const value = buildMockDateFacetValue({});
      dateFacet.setRange(value);
      expect(updateDateFacetValues).toHaveBeenCalledWith({
        facetId,
        values: [
          {
            ...value,
            state: 'selected',
            numberOfResults: 0,
            endInclusive: true,
          },
        ],
      });
    });

    it('dispatches a search', () => {
      const value = buildMockDateFacetValue();
      dateFacet.setRange(value);

      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#clear', () => {
    beforeEach(() => dateFacet.clear());

    it('dispatches #updateDateFacetValues with the facet id and an empty array', () => {
      expect(updateDateFacetValues).toHaveBeenCalledWith({facetId, values: []});
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      expect(updateFacetOptions).toHaveBeenCalled();
    });
  });
});
