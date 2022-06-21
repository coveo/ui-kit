import {buildMockDateFacetRequest} from '../../../../../test/mock-date-facet-request';
import {
  buildInsightDateFilter,
  DateFilter,
  DateFilterInitialState,
  DateFilterOptions,
} from './headless-insight-date-filter';
import {updateDateFacetValues} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {buildMockDateFacetValue} from '../../../../../test/mock-date-facet-value';
import {executeSearch} from '../../../../../features/search/search-actions';
import {updateFacetOptions} from '../../../../../features/facet-options/facet-options-actions';
import {InsightAppState} from '../../../../../state/insight-app-state';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../../../test/mock-engine';
import {buildMockInsightState} from '../../../../../test/mock-insight-state';

describe('insight date filter', () => {
  const facetId = '1';
  let options: DateFilterOptions;
  let initialState: DateFilterInitialState | undefined;
  let state: InsightAppState;
  let engine: MockInsightEngine;
  let dateFacet: DateFilter;

  function initDateFilter() {
    engine = buildMockInsightEngine({state});
    dateFacet = buildInsightDateFilter(engine, {options, initialState});
  }

  beforeEach(() => {
    initialState = undefined;

    options = {
      facetId,
      field: 'created',
    };

    state = buildMockInsightState();
    state.dateFacetSet[facetId] = buildMockDateFacetRequest();

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
});
