import {updateFacetOptions} from '../../../../../features/facet-options/facet-options-actions';
import {updateNumericFacetValues} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions';
import {InsightAppState} from '../../../../../state/insight-app-state';
import {
  buildMockInsightEngine,
  MockedInsightEngine,
} from '../../../../../test/mock-engine-v2';
import {buildMockInsightState} from '../../../../../test/mock-insight-state';
import {buildMockNumericFacetSlice} from '../../../../../test/mock-numeric-facet-slice';
import {buildMockNumericFacetValue} from '../../../../../test/mock-numeric-facet-value';
import {
  buildNumericFilter,
  NumericFilter,
  NumericFilterInitialState,
  NumericFilterOptions,
} from './headless-insight-numeric-filter';

jest.mock(
  '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions'
);
jest.mock('../../../../../features/facet-options/facet-options-actions');
jest.mock('../../../../../features/insight-search/insight-search-actions');

describe('insight numeric filter', () => {
  const facetId = '1';
  let options: NumericFilterOptions;
  let initialState: NumericFilterInitialState | undefined;
  let state: InsightAppState;
  let engine: MockedInsightEngine;
  let numericFacet: NumericFilter;

  function initNumericFilter() {
    engine = buildMockInsightEngine(state);
    numericFacet = buildNumericFilter(engine, {options, initialState});
  }

  beforeEach(() => {
    (updateNumericFacetValues as unknown as jest.Mock).mockReturnValue({});
    initialState = undefined;

    options = {
      facetId,
      field: 'created',
    };

    state = buildMockInsightState();
    state.numericFacetSet[facetId] = buildMockNumericFacetSlice();

    initNumericFilter();
  });

  describe('#setRange', () => {
    it('dispatches a updateNumericFacetValues with the passed value', () => {
      const value = buildMockNumericFacetValue({});
      numericFacet.setRange(value);
      expect(updateNumericFacetValues).toHaveBeenCalledWith({
        facetId,
        values: [
          {...value, state: 'selected', numberOfResults: 0, endInclusive: true},
        ],
      });
    });

    it('dispatches a search', () => {
      const value = buildMockNumericFacetValue();
      numericFacet.setRange(value);

      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#clear', () => {
    beforeEach(() => numericFacet.clear());

    it('dispatches #updateNumericFacetValues with the facet id and an empty array', () => {
      expect(updateNumericFacetValues).toHaveBeenCalledWith({
        facetId,
        values: [],
      });
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      expect(updateFacetOptions).toHaveBeenCalled();
    });

    it('dispatches a search', () => {
      expect(executeSearch).toHaveBeenCalled();
    });
  });
});
