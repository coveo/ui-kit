import {deselectAllFacetValues} from '../../../../../features/facets/facet-set/facet-set-actions';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions';
import {InsightAppState} from '../../../../../state/insight-app-state';
import {
  MockedInsightEngine,
  buildMockInsightEngine,
} from '../../../../../test/mock-engine-v2';
import {buildMockInsightState} from '../../../../../test/mock-insight-state';
import {buildMockNumericFacetSlice} from '../../../../../test/mock-numeric-facet-slice';
import {buildMockNumericFacetValue} from '../../../../../test/mock-numeric-facet-value';
import {
  NumericFacet,
  buildNumericFacet,
  NumericFacetOptions,
} from './headless-insight-numeric-facet';

jest.mock('../../../../../features/insight-search/insight-search-actions');
jest.mock('../../../../../features/facets/facet-set/facet-set-actions');

describe('insight numeric facet', () => {
  const facetId = '1';
  let options: NumericFacetOptions;
  let state: InsightAppState;
  let engine: MockedInsightEngine;
  let numericFacet: NumericFacet;

  function initNumericFacet() {
    engine = buildMockInsightEngine(state);
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

      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#deselectAll', () => {
    beforeEach(() => numericFacet.deselectAll());

    it('dispatches #deselectAllFacetValues with the facet id', () => {
      expect(deselectAllFacetValues).toHaveBeenCalledWith(facetId);
    });

    it('dispatches a search', () => {
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#sortBy', () => {
    it('dispatches a search', () => {
      numericFacet.sortBy('descending');

      expect(executeSearch).toHaveBeenCalled();
    });
  });
});
