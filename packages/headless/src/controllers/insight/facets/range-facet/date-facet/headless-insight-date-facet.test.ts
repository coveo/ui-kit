import {
  DateFacet,
  buildInsightDateFacet,
  DateFacetOptions,
} from './headless-insight-date-facet';
import {
  MockInsightEngine,
  buildMockInsightEngine,
} from '../../../../../test/mock-engine';
import {
  deselectAllDateFacetValues,
  toggleSelectDateFacetValue,
} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {buildMockDateFacetValue} from '../../../../../test/mock-date-facet-value';
import {buildMockDateFacetRequest} from '../../../../../test/mock-date-facet-request';
import {updateFacetOptions} from '../../../../../features/facet-options/facet-options-actions';
import {DateFacetValue} from '../../../../../features/facets/range-facets/date-facet-set/interfaces/response';
import {deselectAllFacetValues} from '../../../../../features/facets/facet-set/facet-set-actions';
import {updateRangeFacetSortCriterion} from '../../../../../features/facets/range-facets/generic/range-facet-actions';
import {InsightAppState} from '../../../../../state/insight-app-state';
import {buildMockInsightState} from '../../../../../test/mock-insight-state';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions';

describe('insight date facet', () => {
  const facetId = '1';
  let options: DateFacetOptions;
  let state: InsightAppState;
  let engine: MockInsightEngine;
  let dateFacet: DateFacet;

  function initDateFacet() {
    engine = buildMockInsightEngine({state});
    dateFacet = buildInsightDateFacet(engine, {options});
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'created',
      generateAutomaticRanges: true,
    };

    state = buildMockInsightState();
    state.dateFacetSet[facetId] = buildMockDateFacetRequest();

    initDateFacet();
  });

  describe('#toggleSelect', () => {
    it('dispatches a toggleSelectDateFacetValue with the passed value', () => {
      const value = buildMockDateFacetValue();
      dateFacet.toggleSelect(value);

      const action = toggleSelectDateFacetValue({facetId, selection: value});
      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches a search', () => {
      const value = buildMockDateFacetValue();
      dateFacet.toggleSelect(value);

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  describe('#deselectAll', () => {
    beforeEach(() => dateFacet.deselectAll());

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
      dateFacet.sortBy(criterion);
      const action = updateRangeFacetSortCriterion({facetId, criterion});

      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      dateFacet.sortBy('descending');

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('dispatches a search', () => {
      dateFacet.sortBy('descending');

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  function testCommonToggleSingleSelect(facetValue: () => DateFacetValue) {
    it('dispatches a #toggleSelect action with the passed facet value', () => {
      dateFacet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        toggleSelectDateFacetValue({facetId, selection: facetValue()})
      );
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      dateFacet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('dispatches a search', () => {
      dateFacet.toggleSingleSelect(facetValue());

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  }

  describe('#toggleSingleSelect when the value state is "idle"', () => {
    const facetValue = () => buildMockDateFacetValue({state: 'idle'});

    testCommonToggleSingleSelect(facetValue);

    it('dispatches a #deselectAllFacetValues action', () => {
      dateFacet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        deselectAllDateFacetValues(facetId)
      );
    });
  });

  describe('#toggleSingleSelect when the value state is not "idle"', () => {
    const facetValue = () => buildMockDateFacetValue({state: 'selected'});

    testCommonToggleSingleSelect(facetValue);

    it('does not dispatch a #deselectAllFacetValues action', () => {
      dateFacet.toggleSingleSelect(facetValue());

      expect(engine.actions).not.toContainEqual(
        deselectAllDateFacetValues(facetId)
      );
    });
  });
});
