import {configuration} from '../../../../app/common-reducers.js';
import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions.js';
import {facetOptionsReducer as facetOptions} from '../../../../features/facet-options/facet-options-slice.js';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice.js';
import {
  deselectAllFacetValues,
  registerFacet,
  updateFacetIsFieldExpanded,
  updateFacetNumberOfValues,
  updateFacetSortCriterion,
} from '../../../../features/facets/facet-set/facet-set-actions.js';
import {
  executeToggleFacetExclude,
  executeToggleFacetSelect,
} from '../../../../features/facets/facet-set/facet-set-controller-actions.js';
import {facetSetReducer as facetSet} from '../../../../features/facets/facet-set/facet-set-slice.js';
import type {FacetRequest} from '../../../../features/facets/facet-set/interfaces/request.js';
import type {FacetValue} from '../../../../features/facets/facet-set/interfaces/response.js';
import type {SearchAppState} from '../../../../state/search-app-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../../test/mock-engine-v2.js';
import {buildMockFacetRequest} from '../../../../test/mock-facet-request.js';
import {buildMockFacetResponse} from '../../../../test/mock-facet-response.js';
import {buildMockFacetSearch} from '../../../../test/mock-facet-search.js';
import {buildMockFacetSlice} from '../../../../test/mock-facet-slice.js';
import {buildMockFacetValue} from '../../../../test/mock-facet-value.js';
import {createMockState} from '../../../../test/mock-state.js';
import * as FacetIdDeterminor from '../_common/facet-id-determinor.js';
import {
  buildCoreFacet,
  type CoreFacet,
  type FacetOptions,
} from './headless-core-facet.js';

vi.mock('../../../../features/facets/facet-set/facet-set-actions');
vi.mock('../../../../features/facet-options/facet-options-actions');
vi.mock('../../../../features/facets/facet-set/facet-set-controller-actions');

describe('facet', () => {
  const facetId = '1';
  let options: FacetOptions;
  let state: SearchAppState;
  let engine: MockedSearchEngine;
  let facet: CoreFacet;

  function initFacet() {
    engine = buildMockSearchEngine(state);
    facet = buildCoreFacet(engine, {options});
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
      facetSearch: {},
    };

    state = createMockState();
    setFacetRequest();

    initFacet();
  });

  it('renders', () => {
    expect(facet).toBeTruthy();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      facetSet,
      configuration,
      facetSearchSet,
      facetOptions,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(facet.subscribe).toBeTruthy();
  });

  it('it calls #determineFacetId with the correct params', () => {
    vi.spyOn(FacetIdDeterminor, 'determineFacetId');

    initFacet();

    expect(FacetIdDeterminor.determineFacetId).toHaveBeenCalledWith(
      engine,
      options
    );
  });

  it('registers a facet with the passed options and the default values of unspecified options', () => {
    expect(registerFacet).toHaveBeenCalledWith({
      field: 'author',
      activeTab: '',
      tabs: {},
      sortCriteria: 'score',
      resultsMustMatch: 'atLeastOneValue',
      facetId,
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 8,
    });
  });

  it('registering a facet with #numberOfValues less than 1 throws', () => {
    options.numberOfValues = 0;
    expect(() => initFacet()).toThrow('Check the options of buildFacet');
  });

  it('registering a facet with a space in the id throws', () => {
    options.facetId = 'bad id';
    expect(() => initFacet()).toThrow('Check the options of buildFacet');
  });

  it('#state.facetId exposes the facet id', () => {
    expect(facet.state.facetId).toBe(facetId);
  });

  it('when the search response is empty, the facet #state.values is an empty array', () => {
    expect(state.search.response.facets).toEqual([]);
    expect(facet.state.values).toEqual([]);
  });

  it('when the search response has a facet, the facet #state.values contains the same values', () => {
    const values = [buildMockFacetValue()];
    const facetResponse = buildMockFacetResponse({
      facetId,
      values,
    });

    state.search.response.facets = [facetResponse];
    expect(facet.state.values).toBe(values);
  });

  describe('#toggleSelect', () => {
    it('dispatches a #toggleSelect action with the passed facet value', () => {
      const facetValue = buildMockFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);
      expect(executeToggleFacetSelect).toHaveBeenCalledWith(
        expect.objectContaining({facetId, selection: facetValue})
      );
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches a #toggleExclude action with the passed facet value', () => {
      const facetValue = buildMockFacetValue({value: 'TED'});
      facet.toggleExclude(facetValue);
      expect(executeToggleFacetExclude).toHaveBeenCalledWith({
        facetId,
        selection: facetValue,
      });
    });
  });

  function testCommonToggleSingleSelect(facetValue: () => FacetValue) {
    it('dispatches a #toggleSelect action with the passed facet value', () => {
      facet.toggleSingleSelect(facetValue());
      expect(executeToggleFacetSelect).toHaveBeenCalledWith(
        expect.objectContaining({facetId})
      );
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
      expect(deselectAllFacetValues).not.toHaveBeenCalledWith(
        expect.objectContaining({facetId})
      );
    });
  });

  it('#isValueSelected returns true when the passed value is selected', () => {
    const facetValue = buildMockFacetValue({state: 'selected'});
    expect(facet.isValueSelected(facetValue)).toBe(true);
  });

  it('#isValueSelected returns false when the passed value is not selected (e.g. idle)', () => {
    const facetValue = buildMockFacetValue({state: 'idle'});
    expect(facet.isValueSelected(facetValue)).toBe(false);
  });

  describe('#deselectAll', () => {
    it('dispatches #deselectAllFacetValues with the facet id', () => {
      facet.deselectAll();
      expect(deselectAllFacetValues).toHaveBeenCalledWith(facetId);
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      facet.deselectAll();
      expect(updateFacetOptions).toHaveBeenCalled();
    });
  });

  describe('#state.hasActiveValues', () => {
    it('when #state.values has a value with a non-idle state, it returns true', () => {
      const facetResponse = buildMockFacetResponse({facetId});
      facetResponse.values = [buildMockFacetValue({state: 'selected'})];
      state.search.response.facets = [facetResponse];

      expect(facet.state.hasActiveValues).toBe(true);
    });

    it('when #state.values only has idle values, it returns false', () => {
      const facetResponse = buildMockFacetResponse({facetId});
      facetResponse.values = [buildMockFacetValue({state: 'idle'})];
      state.search.response.facets = [facetResponse];

      expect(facet.state.hasActiveValues).toBe(false);
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
      expect(updateFacetOptions).toHaveBeenCalled();
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

    it(`when the numberOfValues on the request is not a multiple of the configured number,
    it increases the number to make it a multiple`, () => {
      const numberOfValuesInState = 7;
      const configuredNumberOfValues = 5;
      options.numberOfValues = configuredNumberOfValues;

      setFacetRequest({numberOfValues: numberOfValuesInState});
      initFacet();

      facet.showMoreValues();

      expect(updateFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: 10,
      });
    });

    it('updates isFieldExpanded to true', () => {
      facet.showMoreValues();

      expect(updateFacetIsFieldExpanded).toHaveBeenCalledWith({
        facetId,
        isFieldExpanded: true,
      });
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      facet.showMoreValues();
      expect(updateFacetOptions).toHaveBeenCalled();
    });
  });

  describe('#state.canShowMoreValues', () => {
    it('when there is no response, it returns false', () => {
      expect(facet.state.canShowMoreValues).toBe(false);
    });

    it('when #moreValuesAvailable on the response is true, it returns true', () => {
      const facetResponse = buildMockFacetResponse({
        facetId,
        moreValuesAvailable: true,
      });

      state.search.response.facets = [facetResponse];
      expect(facet.state.canShowMoreValues).toBe(true);
    });

    it('when #moreValuesAvailable on the response is false, it returns false', () => {
      const facetResponse = buildMockFacetResponse({
        facetId,
        moreValuesAvailable: false,
      });

      state.search.response.facets = [facetResponse];
      expect(facet.state.canShowMoreValues).toBe(false);
    });
  });

  describe('#showLessValues', () => {
    it('sets the number of values to the original number', () => {
      const originalNumberOfValues = 8;
      options.numberOfValues = originalNumberOfValues;

      setFacetRequest({numberOfValues: 25});
      initFacet();

      facet.showLessValues();

      expect(updateFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: originalNumberOfValues,
      });
    });

    it(`when the number of non-idle values is greater than the original number,
    it sets the number of values to the non-idle number`, () => {
      options.numberOfValues = 1;
      const selectedValue = buildMockFacetValue({state: 'selected'});
      const currentValues = [selectedValue, selectedValue];

      setFacetRequest({currentValues, numberOfValues: 5});
      initFacet();

      facet.showLessValues();

      expect(updateFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: currentValues.length,
      });
    });

    it('updates isFieldExpanded to false', () => {
      facet.showLessValues();

      expect(updateFacetIsFieldExpanded).toHaveBeenCalledWith({
        facetId,
        isFieldExpanded: false,
      });
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      facet.showLessValues();

      expect(updateFacetOptions).toHaveBeenCalled();
    });
  });

  describe('#state.canShowLessValues', () => {
    it('when the number of currentValues is equal to the configured number, it returns false', () => {
      options.numberOfValues = 1;

      const currentValues = [buildMockFacetValue()];
      setFacetRequest({currentValues});

      initFacet();

      expect(facet.state.canShowLessValues).toBe(false);
    });

    it('when the number of currentValues is greater than the configured number, it returns true', () => {
      options.numberOfValues = 1;
      const value = buildMockFacetValue();

      setFacetRequest({currentValues: [value, value]});
      initFacet();

      expect(facet.state.canShowLessValues).toBe(true);
    });

    it(`when the number of currentValues is greater than the configured number,
    when there are no idle values, it returns false`, () => {
      options.numberOfValues = 1;
      const selectedValue = buildMockFacetValue({state: 'selected'});

      setFacetRequest({currentValues: [selectedValue, selectedValue]});
      initFacet();

      expect(facet.state.canShowLessValues).toBe(false);
    });
  });
});
