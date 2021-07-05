import {buildFacet, Facet, FacetOptions} from './headless-facet';
import {
  MockSearchEngine,
  buildMockSearchAppEngine,
} from '../../../test/mock-engine';
import {
  registerFacet,
  toggleSelectFacetValue,
  deselectAllFacetValues,
  updateFacetSortCriterion,
  updateFacetNumberOfValues,
  updateFacetIsFieldExpanded,
} from '../../../features/facets/facet-set/facet-set-actions';
import {createMockState} from '../../../test/mock-state';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {buildMockFacetValue} from '../../../test/mock-facet-value';
import {executeSearch} from '../../../features/search/search-actions';
import {FacetRequest} from '../../../features/facets/facet-set/interfaces/request';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';

import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {SearchAppState} from '../../../state/search-app-state';
import * as FacetIdDeterminor from '../_common/facet-id-determinor';
import {buildMockFacetSearch} from '../../../test/mock-facet-search';
import * as FacetSearch from '../facet-search/specific/headless-facet-search';
import {
  configuration,
  facetSearchSet,
  facetSet,
  search,
} from '../../../app/reducers';
import {FacetValue} from '../../../features/facets/facet-set/interfaces/response';

describe('facet', () => {
  const facetId = '1';
  let options: FacetOptions;
  let state: SearchAppState;
  let engine: MockSearchEngine;
  let facet: Facet;

  function initFacet() {
    engine = buildMockSearchAppEngine({state});
    facet = buildFacet(engine, {options});
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
      search,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(facet.subscribe).toBeTruthy();
  });

  it('it calls #determineFacetId with the correct params', () => {
    jest.spyOn(FacetIdDeterminor, 'determineFacetId');

    initFacet();

    expect(FacetIdDeterminor.determineFacetId).toHaveBeenCalledWith(
      engine,
      options
    );
  });

  it('registers a facet with the passed options and the default values of unspecified options', () => {
    const action = registerFacet({
      ...options,
      facetId,
      delimitingCharacter: '>',
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 8,
    });

    expect(engine.actions).toContainEqual(action);
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

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
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

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
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

    it(`when the numberOfValues on the request is not a multiple of the configured number,
    it increases the number to make it a multiple`, () => {
      const numberOfValuesInState = 7;
      const configuredNumberOfValues = 5;
      options.numberOfValues = configuredNumberOfValues;

      setFacetRequest({numberOfValues: numberOfValuesInState});
      initFacet();

      facet.showMoreValues();

      const action = updateFacetNumberOfValues({
        facetId,
        numberOfValues: 10,
      });

      expect(engine.actions).toContainEqual(action);
    });

    it('updates isFieldExpanded to true', () => {
      facet.showMoreValues();

      const action = updateFacetIsFieldExpanded({
        facetId,
        isFieldExpanded: true,
      });

      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      facet.showMoreValues();

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('executes a search', () => {
      facet.showMoreValues();

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
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
    it('sets the number of values to the origial number', () => {
      const originalNumberOfValues = 8;
      options.numberOfValues = originalNumberOfValues;

      setFacetRequest({numberOfValues: 25});
      initFacet();

      facet.showLessValues();

      const action = updateFacetNumberOfValues({
        facetId,
        numberOfValues: originalNumberOfValues,
      });

      expect(engine.actions).toContainEqual(action);
    });

    it(`when the number of non-idle values is greater than the original number,
    it sets the number of values to the non-idle number`, () => {
      options.numberOfValues = 1;
      const selectedValue = buildMockFacetValue({state: 'selected'});
      const currentValues = [selectedValue, selectedValue];

      setFacetRequest({currentValues, numberOfValues: 5});
      initFacet();

      facet.showLessValues();

      const action = updateFacetNumberOfValues({
        facetId,
        numberOfValues: currentValues.length,
      });

      expect(engine.actions).toContainEqual(action);
    });

    it('updates isFieldExpanded to false', () => {
      facet.showLessValues();

      const action = updateFacetIsFieldExpanded({
        facetId,
        isFieldExpanded: false,
      });

      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      facet.showLessValues();

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });

    it('executes a search', () => {
      facet.showLessValues();
      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
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

  it('exposes a #facetSearch property', () => {
    jest.spyOn(FacetSearch, 'buildFacetSearch');
    initFacet();
    expect(facet.facetSearch).toBeTruthy();
    expect(FacetSearch.buildFacetSearch).toHaveBeenCalled();
  });

  it('exposes a #facetSearch state', () => {
    expect(facet.state.facetSearch).toBeTruthy();
    expect(facet.state.facetSearch.values).toEqual([]);

    const fakeResponseValue = {
      count: 123,
      displayValue: 'foo',
      rawValue: 'foo',
    };
    engine.state.facetSearchSet[facetId].response.values = [fakeResponseValue];

    expect(facet.state.facetSearch.values[0]).toMatchObject(fakeResponseValue);
  });
});
