import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions';
import {
  deselectAllFacetValues,
  updateFacetSortCriterion,
  updateFacetNumberOfValues,
} from '../../../../features/facets/facet-set/facet-set-actions';
import {executeToggleFacetSelect} from '../../../../features/facets/facet-set/facet-set-controller-actions';
import {FacetRequest} from '../../../../features/facets/facet-set/interfaces/request';
import {FacetValue} from '../../../../features/facets/facet-set/interfaces/response';
import {
  executeSearch,
  fetchFacetValues,
} from '../../../../features/insight-search/insight-search-actions';
import {InsightAppState} from '../../../../state/insight-app-state';
import {
  MockedInsightEngine,
  buildMockInsightEngine,
} from '../../../../test/mock-engine-v2';
import {buildMockFacetRequest} from '../../../../test/mock-facet-request';
import {buildMockFacetSearch} from '../../../../test/mock-facet-search';
import {buildMockFacetSlice} from '../../../../test/mock-facet-slice';
import {buildMockFacetValue} from '../../../../test/mock-facet-value';
import {buildMockInsightState} from '../../../../test/mock-insight-state';
import {buildFacet, Facet, FacetOptions} from './headless-insight-facet';

jest.mock('../../../../features/facets/facet-set/facet-set-actions');
jest.mock('../../../../features/insight-search/insight-search-actions');
jest.mock('../../../../features/facet-options/facet-options-actions');
jest.mock('../../../../features/facets/facet-set/facet-set-controller-actions');

describe('InsightFacet', () => {
  const facetId = '1';
  let options: FacetOptions;
  let state: InsightAppState;
  let engine: MockedInsightEngine;
  let facet: Facet;

  function initFacet() {
    engine = buildMockInsightEngine(state);
    facet = buildFacet(engine, {options});
  }

  function setFacetRequest(config: Partial<FacetRequest> = {}) {
    state.facetSet[facetId] = buildMockFacetSlice({
      request: buildMockFacetRequest({facetId, ...config}),
    });
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

      expect(executeToggleFacetSelect).toHaveBeenCalledWith({
        facetId,
        selection: facetValue,
      });
    });

    it('dispatches a search', () => {
      const facetValue = buildMockFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);

      expect(executeSearch).toHaveBeenCalled();
    });
  });

  function testCommonToggleSingleSelect(facetValue: () => FacetValue) {
    it('dispatches a #toggleSelect action with the passed facet value', () => {
      facet.toggleSingleSelect(facetValue());

      expect(executeToggleFacetSelect).toHaveBeenCalledWith({
        facetId,
        selection: facetValue(),
      });
    });

    it('dispatches a search', () => {
      facet.toggleSingleSelect(facetValue());

      expect(executeSearch).toHaveBeenCalled();
    });
  }

  describe('#toggleSingleSelect when the value state is "idle"', () => {
    const facetValue = () => buildMockFacetValue({value: 'TED', state: 'idle'});

    testCommonToggleSingleSelect(facetValue);

    it('dispatches a #deselectAllFacetValues action', () => {
      facet.toggleSingleSelect(facetValue());
      expect(deselectAllFacetValues).toHaveBeenCalledWith(facetId);
    });
  });

  describe('#toggleSingleSelect when the value state is not "idle"', () => {
    const facetValue = () =>
      buildMockFacetValue({value: 'TED', state: 'selected'});

    testCommonToggleSingleSelect(facetValue);

    it('does not dispatch a #deselectAllFacetValues action', () => {
      facet.toggleSingleSelect(facetValue());

      expect(deselectAllFacetValues).toHaveBeenCalledWith(facetId);
    });
  });

  describe('#deselectAll', () => {
    it('dispatches #deselectAllFacetValues with the facet id', () => {
      facet.deselectAll();

      expect(deselectAllFacetValues).toHaveBeenCalledWith(facetId);
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      facet.deselectAll();

      expect(updateFacetOptions).toHaveBeenCalledWith();
    });

    it('dispatches a search', () => {
      facet.deselectAll();

      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#sortBy', () => {
    it('dispatches a #updateFacetSortCriterion action with the passed value', () => {
      const criterion = 'score';
      facet.sortBy(criterion);

      expect(updateFacetSortCriterion).toHaveBeenCalledWith({
        facetId,
        criterion,
      });
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      facet.sortBy('score');

      expect(updateFacetOptions).toHaveBeenCalledWith();
    });

    it('dispatches a search', () => {
      facet.sortBy('score');
      expect(executeSearch).toHaveBeenCalled();
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
      expect(updateFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: expectedNumber,
      });
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      facet.showMoreValues();

      expect(updateFacetOptions).toHaveBeenCalledWith();
    });

    it('executes a fetchFacetValues action', () => {
      facet.showMoreValues();
      expect(fetchFacetValues).toHaveBeenCalled();
    });
  });

  describe('#showLessValues', () => {
    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      facet.showLessValues();

      expect(updateFacetOptions).toHaveBeenCalledWith();
    });

    it('executes a fetchFacetValues action', () => {
      facet.showLessValues();

      expect(fetchFacetValues).toHaveBeenCalled();
    });
  });
});
