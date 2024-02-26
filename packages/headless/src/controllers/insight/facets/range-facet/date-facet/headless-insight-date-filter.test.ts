import {updateFacetOptions} from '../../../../../features/facet-options/facet-options-actions';
import {updateDateFacetValues} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions';
import {InsightAppState} from '../../../../../state/insight-app-state';
import {buildMockDateFacetSlice} from '../../../../../test/mock-date-facet-slice';
import {buildMockDateFacetValue} from '../../../../../test/mock-date-facet-value';
import {
  buildMockInsightEngine,
  MockedInsightEngine,
} from '../../../../../test/mock-engine-v2';
import {buildMockInsightState} from '../../../../../test/mock-insight-state';
import {
  buildDateFilter,
  DateFilter,
  DateFilterInitialState,
  DateFilterOptions,
} from './headless-insight-date-filter';

jest.mock(
  '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions'
);
jest.mock('../../../../../features/facet-options/facet-options-actions');
jest.mock('../../../../../features/insight-search/insight-search-actions');

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
    (updateDateFacetValues as unknown as jest.Mock).mockReturnValue(() => {});
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
