import {
  NumericFacet,
  buildInsightNumericFacet,
  NumericFacetOptions,
} from './headless-insight-numeric-facet';
import {
  MockInsightEngine,
  buildMockInsightEngine,
} from '../../../../../test/mock-engine';
import {
  deselectAllNumericFacetValues,
  toggleSelectNumericFacetValue,
} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {buildMockNumericFacetValue} from '../../../../../test/mock-numeric-facet-value';
import {buildMockNumericFacetRequest} from '../../../../../test/mock-numeric-facet-request';
import {updateFacetOptions} from '../../../../../features/facet-options/facet-options-actions';
import {NumericFacetValue} from '../../../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {deselectAllFacetValues} from '../../../../../features/facets/facet-set/facet-set-actions';
import {updateRangeFacetSortCriterion} from '../../../../../features/facets/range-facets/generic/range-facet-actions';
import {InsightAppState} from '../../../../../state/insight-app-state';
import {buildMockInsightState} from '../../../../../test/mock-insight-state';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions';

describe('insight numeric facet', () => {
  const facetId = '1';
  let options: NumericFacetOptions;
  let state: InsightAppState;
  let engine: MockInsightEngine;
  let numericFacet: NumericFacet;

  function initNumericFacet() {
    engine = buildMockInsightEngine({state});
    numericFacet = buildInsightNumericFacet(engine, {options});
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'created',
      generateAutomaticRanges: true,
    };

    state = buildMockInsightState();
    state.numericFacetSet[facetId] = buildMockNumericFacetRequest();

    initNumericFacet();
  });

  describe('#toggleSelect', () => {
    it('dispatches a toggleSelectNumericFacetValue with the passed value', () => {
      const value = buildMockNumericFacetValue();
      numericFacet.toggleSelect(value);

      const action = toggleSelectNumericFacetValue({facetId, selection: value});
      expect(engine.actions).toContainEqual(action);
    });

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

  describe('#sortBy', () => {
    it('dispatches #updateRangeFacetSortCriterion', () => {
      const criterion = 'descending';
      numericFacet.sortBy(criterion);
      const action = updateRangeFacetSortCriterion({facetId, criterion});

      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      numericFacet.sortBy('descending');

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('dispatches a search', () => {
      numericFacet.sortBy('descending');

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  function testCommonToggleSingleSelect(facetValue: () => NumericFacetValue) {
    it('dispatches a #toggleSelect action with the passed facet value', () => {
      numericFacet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        toggleSelectNumericFacetValue({facetId, selection: facetValue()})
      );
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      numericFacet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('dispatches a search', () => {
      numericFacet.toggleSingleSelect(facetValue());

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  }

  describe('#toggleSingleSelect when the value state is "idle"', () => {
    const facetValue = () => buildMockNumericFacetValue({state: 'idle'});

    testCommonToggleSingleSelect(facetValue);

    it('dispatches a #deselectAllFacetValues action', () => {
      numericFacet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        deselectAllNumericFacetValues(facetId)
      );
    });
  });

  describe('#toggleSingleSelect when the value state is not "idle"', () => {
    const facetValue = () => buildMockNumericFacetValue({state: 'selected'});

    testCommonToggleSingleSelect(facetValue);

    it('does not dispatch a #deselectAllFacetValues action', () => {
      numericFacet.toggleSingleSelect(facetValue());

      expect(engine.actions).not.toContainEqual(
        deselectAllNumericFacetValues(facetId)
      );
    });
  });
});
