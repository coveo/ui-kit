import {updateFacetOptions} from '../../../../../features/facet-options/facet-options-actions.js';
import {updateNumericFacetValues} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions.js';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions.js';
import {InsightAppState} from '../../../../../state/insight-app-state.js';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../../../test/mock-engine.js';
import {buildMockInsightState} from '../../../../../test/mock-insight-state.js';
import {buildMockNumericFacetSlice} from '../../../../../test/mock-numeric-facet-slice.js';
import {buildMockNumericFacetValue} from '../../../../../test/mock-numeric-facet-value.js';
import {
  buildNumericFilter,
  NumericFilter,
  NumericFilterInitialState,
  NumericFilterOptions,
} from './headless-insight-numeric-filter.js';

describe('insight numeric filter', () => {
  const facetId = '1';
  let options: NumericFilterOptions;
  let initialState: NumericFilterInitialState | undefined;
  let state: InsightAppState;
  let engine: MockInsightEngine;
  let numericFacet: NumericFilter;

  function initNumericFilter() {
    engine = buildMockInsightEngine({state});
    numericFacet = buildNumericFilter(engine, {options, initialState});
  }

  beforeEach(() => {
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

      const action = updateNumericFacetValues({
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
      const value = buildMockNumericFacetValue();
      numericFacet.setRange(value);

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  describe('#clear', () => {
    beforeEach(() => numericFacet.clear());

    it('dispatches #updateNumericFacetValues with the facet id and an empty array', () => {
      expect(engine.actions).toContainEqual(
        updateNumericFacetValues({facetId, values: []})
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
