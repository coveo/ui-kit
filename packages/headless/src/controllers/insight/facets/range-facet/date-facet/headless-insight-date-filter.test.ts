import {updateFacetOptions} from '../../../../../features/facet-options/facet-options-actions';
import {updateDateFacetValues} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {executeSearch} from '../../../../../features/search/search-actions';
import {InsightAppState} from '../../../../../state/insight-app-state';
import {buildMockDateFacetSlice} from '../../../../../test/mock-date-facet-slice';
import {buildMockDateFacetValue} from '../../../../../test/mock-date-facet-value';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../../../test/mock-engine';
import {buildMockInsightState} from '../../../../../test/mock-insight-state';
import {
  buildDateFilter,
  DateFilter,
  DateFilterInitialState,
  DateFilterOptions,
} from './headless-insight-date-filter';

describe('insight date filter', () => {
  const facetId = '1';
  let options: DateFilterOptions;
  let initialState: DateFilterInitialState | undefined;
  let state: InsightAppState;
  let engine: MockInsightEngine;
  let dateFacet: DateFilter;

  function initDateFilter() {
    engine = buildMockInsightEngine({state});
    dateFacet = buildDateFilter(engine, {options, initialState});
  }

  beforeEach(() => {
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

      const action = updateDateFacetValues({
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
      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches a search', () => {
      const value = buildMockDateFacetValue();
      dateFacet.setRange(value);

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  describe('#clear', () => {
    beforeEach(() => dateFacet.clear());

    it('dispatches #updateDateFacetValues with the facet id and an empty array', () => {
      expect(engine.actions).toContainEqual(
        updateDateFacetValues({facetId, values: []})
      );
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      expect(engine.actions).toContainEqual(updateFacetOptions());
    });

    it('dispatches a search', () => {
      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );

      expect(engine.actions).toContainEqual(action);
    });
  });
});
