import {deselectAllFacetValues} from '../../../../../features/facets/facet-set/facet-set-actions';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions';
import {InsightAppState} from '../../../../../state/insight-app-state';
import {
  MockInsightEngine,
  buildMockInsightEngine,
} from '../../../../../test/mock-engine';
import {buildMockInsightState} from '../../../../../test/mock-insight-state';
import {buildMockNumericFacetSlice} from '../../../../../test/mock-numeric-facet-slice';
import {buildMockNumericFacetValue} from '../../../../../test/mock-numeric-facet-value';
import {
  NumericFacet,
  buildNumericFacet,
  NumericFacetOptions,
} from './headless-insight-numeric-facet';

describe('insight numeric facet', () => {
  const facetId = '1';
  let options: NumericFacetOptions;
  let state: InsightAppState;
  let engine: MockInsightEngine;
  let numericFacet: NumericFacet;

  function initNumericFacet() {
    engine = buildMockInsightEngine({state});
    numericFacet = buildNumericFacet(engine, {options});
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'created',
      generateAutomaticRanges: true,
    };

    state = buildMockInsightState();
    state.numericFacetSet[facetId] = buildMockNumericFacetSlice();

    initNumericFacet();
  });

  describe('#toggleSelect', () => {
    it('dispatches a search', () => {
      const value = buildMockNumericFacetValue();
      numericFacet.toggleSelect(value);

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  describe('#deselectAll', () => {
    beforeEach(() => numericFacet.deselectAll());

    it('dispatches #deselectAllFacetValues with the facet id', () => {
      expect(engine.actions).toContainEqual(deselectAllFacetValues(facetId));
    });

    it('dispatches a search', () => {
      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );

      expect(engine.actions).toContainEqual(action);
    });
  });

  describe('#sortBy', () => {
    it('dispatches a search', () => {
      numericFacet.sortBy('descending');

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });
});
