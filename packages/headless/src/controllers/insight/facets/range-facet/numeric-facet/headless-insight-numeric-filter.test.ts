import {buildMockNumericFacetRequest} from '../../../../../test/mock-numeric-facet-request';
import {
  buildInsightNumericFilter,
  NumericFilter,
  NumericFilterInitialState,
  NumericFilterOptions,
} from './headless-insight-numeric-filter';
import {updateNumericFacetValues} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {buildMockNumericFacetValue} from '../../../../../test/mock-numeric-facet-value';
import {updateFacetOptions} from '../../../../../features/facet-options/facet-options-actions';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../../../test/mock-engine';
import {InsightAppState} from '../../../../../state/insight-app-state';
import {buildMockInsightState} from '../../../../../test/mock-insight-state';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions';

describe('insight numeric filter', () => {
  const facetId = '1';
  let options: NumericFilterOptions;
  let initialState: NumericFilterInitialState | undefined;
  let state: InsightAppState;
  let engine: MockInsightEngine;
  let numericFacet: NumericFilter;

  function initNumericFilter() {
    engine = buildMockInsightEngine({state});
    numericFacet = buildInsightNumericFilter(engine, {options, initialState});
  }

  beforeEach(() => {
    initialState = undefined;

    options = {
      facetId,
      field: 'created',
    };

    state = buildMockInsightState();
    state.numericFacetSet[facetId] = buildMockNumericFacetRequest();

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
