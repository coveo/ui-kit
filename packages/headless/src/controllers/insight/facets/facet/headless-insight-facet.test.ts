import {buildInsightFacet, Facet, FacetOptions} from './headless-insight-facet';
import {
  MockInsightEngine,
  buildMockInsightEngine,
} from '../../../../test/mock-engine';
import {
  toggleSelectFacetValue,
  deselectAllFacetValues,
  updateFacetSortCriterion,
  updateFacetNumberOfValues,
} from '../../../../features/facets/facet-set/facet-set-actions';
import {buildMockFacetValue} from '../../../../test/mock-facet-value';
import {
  executeSearch,
  fetchFacetValues,
} from '../../../../features/insight-search/insight-search-actions';
import {FacetRequest} from '../../../../features/facets/facet-set/interfaces/request';
import {buildMockFacetRequest} from '../../../../test/mock-facet-request';

import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions';
import {buildMockFacetSearch} from '../../../../test/mock-facet-search';
import {FacetValue} from '../../../../features/facets/facet-set/interfaces/response';
import {InsightAppState} from '../../../../state/insight-app-state';
import {buildMockInsightState} from '../../../../test/mock-insight-state';

describe('InsightFacet', () => {
  const facetId = '1';
  let options: FacetOptions;
  let state: InsightAppState;
  let engine: MockInsightEngine;
  let facet: Facet;

  function initFacet() {
    engine = buildMockInsightEngine({state});
    facet = buildInsightFacet(engine, {options});
  }

  function setFacetRequest(config: Partial<FacetRequest> = {}) {
    state.facetSet[facetId] = buildMockFacetRequest({facetId, ...config});
    state.facetSearchSet[facetId] = buildMockFacetSearch();
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'author',
      sortCriteria: 'score',
      allowedValues: ['foo', 'bar'],
    };

    state = buildMockInsightState();
    setFacetRequest();

    initFacet();
  });

  it('renders', () => {
    expect(facet).toBeTruthy();
  });

  describe('#toggleSelect', () => {
    it('dispatches a #toggleSelect action with the passed facet value', () => {
      const facetValue = buildMockFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);

      expect(engine.actions).toContainEqual(
        toggleSelectFacetValue({facetId, selection: facetValue})
      );
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      const facetValue = buildMockFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('dispatches a search', () => {
      const facetValue = buildMockFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: executeSearch.pending.type,
        })
      );
    });
  });

  function testCommonToggleSingleSelect(facetValue: () => FacetValue) {
    it('dispatches a #toggleSelect action with the passed facet value', () => {
      facet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        toggleSelectFacetValue({facetId, selection: facetValue()})
      );
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      facet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('dispatches a search', () => {
      facet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: executeSearch.pending.type,
        })
      );
    });
  }

  describe('#toggleSingleSelect when the value state is "idle"', () => {
    const facetValue = () => buildMockFacetValue({value: 'TED', state: 'idle'});

    testCommonToggleSingleSelect(facetValue);

    it('dispatches a #deselectAllFacetValues action', () => {
      facet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(deselectAllFacetValues(facetId));
    });
  });

  describe('#toggleSingleSelect when the value state is not "idle"', () => {
    const facetValue = () =>
      buildMockFacetValue({value: 'TED', state: 'selected'});

    testCommonToggleSingleSelect(facetValue);

    it('does not dispatch a #deselectAllFacetValues action', () => {
      facet.toggleSingleSelect(facetValue());

      expect(engine.actions).not.toContainEqual(
        deselectAllFacetValues(facetId)
      );
    });
  });

  describe('#deselectAll', () => {
    it('dispatches #deselectAllFacetValues with the facet id', () => {
      facet.deselectAll();
      expect(engine.actions).toContainEqual(deselectAllFacetValues(facetId));
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      facet.deselectAll();

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('dispatches a search', () => {
      facet.deselectAll();

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(engine.actions).toContainEqual(action);
    });
  });

  describe('#sortBy', () => {
    it('dispatches a #updateFacetSortCriterion action with the passed value', () => {
      const criterion = 'score';
      facet.sortBy(criterion);

      const action = updateFacetSortCriterion({
        facetId,
        criterion,
      });

      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      facet.sortBy('score');

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('dispatches a search', () => {
      facet.sortBy('score');
      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );

      expect(engine.actions).toContainEqual(action);
    });
  });

  it('when the passed criterion matches the active sort criterion, #isSortedBy returns true', () => {
    const criterion = 'score';
    setFacetRequest({sortCriteria: criterion});

    expect(facet.isSortedBy(criterion)).toBe(true);
  });

  it('when the passed criterion does not match the active sort criterion, #isSortedBy returns false', () => {
    setFacetRequest({sortCriteria: 'alphanumeric'});

    expect(facet.isSortedBy('score')).toBe(false);
  });

  describe('#showMoreValues', () => {
    it('dispatches increases the number of values on the request by the configured amount', () => {
      const numberOfValuesInState = 10;
      const configuredNumberOfValues = 5;
      options.numberOfValues = configuredNumberOfValues;

      setFacetRequest({numberOfValues: numberOfValuesInState});
      initFacet();

      facet.showMoreValues();

      const expectedNumber = numberOfValuesInState + configuredNumberOfValues;
      const action = updateFacetNumberOfValues({
        facetId,
        numberOfValues: expectedNumber,
      });

      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      facet.showMoreValues();

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('executes a fetchFacetValues action', () => {
      facet.showMoreValues();

      const action = engine.actions.find(
        (a) => a.type === fetchFacetValues.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  describe('#showLessValues', () => {
    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      facet.showLessValues();

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('executes a fetchFacetValues action', () => {
      facet.showLessValues();
      const action = engine.actions.find(
        (a) => a.type === fetchFacetValues.pending.type
      );
      expect(action).toBeTruthy();
    });
  });
});
