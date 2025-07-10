import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import {updateFacetOptions} from '../../../../../features/facet-options/facet-options-actions.js';
import {updateNumericFacetValues} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions.js';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions.js';
import type {InsightAppState} from '../../../../../state/insight-app-state.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../../../test/mock-insight-state.js';
import {buildMockNumericFacetSlice} from '../../../../../test/mock-numeric-facet-slice.js';
import {buildMockNumericFacetValue} from '../../../../../test/mock-numeric-facet-value.js';
import {
  buildNumericFilter,
  type NumericFilter,
  type NumericFilterInitialState,
  type NumericFilterOptions,
} from './headless-insight-numeric-filter.js';

vi.mock(
  '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions'
);
vi.mock('../../../../../features/facet-options/facet-options-actions');
vi.mock('../../../../../features/insight-search/insight-search-actions');

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
    (updateNumericFacetValues as unknown as Mock).mockReturnValue({});
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
