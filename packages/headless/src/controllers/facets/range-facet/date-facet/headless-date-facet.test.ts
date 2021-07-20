import {
  DateFacet,
  buildDateFacet,
  DateFacetOptions,
  buildDateRange,
  DateFacetValue,
} from './headless-date-facet';
import {
  MockSearchEngine,
  buildMockSearchAppEngine,
} from '../../../../test/mock-engine';
import {createMockState} from '../../../../test/mock-state';
import {executeSearch} from '../../../../features/search/search-actions';
import {
  deselectAllDateFacetValues,
  registerDateFacet,
  toggleSelectDateFacetValue,
} from '../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value';
import {buildMockDateFacetResponse} from '../../../../test/mock-date-facet-response';
import {SearchAppState} from '../../../../state/search-app-state';
import * as FacetIdDeterminor from '../../_common/facet-id-determinor';
import {buildMockDateFacetRequest} from '../../../../test/mock-date-facet-request';
import {
  configuration,
  dateFacetSet,
  search,
  relativeDateSet,
} from '../../../../app/reducers';
import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions';

describe('date facet', () => {
  const facetId = '1';
  let options: DateFacetOptions;
  let state: SearchAppState;
  let engine: MockSearchEngine;
  let dateFacet: DateFacet;

  function initDateFacet() {
    engine = buildMockSearchAppEngine({state});
    dateFacet = buildDateFacet(engine, {options});
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'created',
      generateAutomaticRanges: true,
    };

    state = createMockState();
    state.dateFacetSet[facetId] = buildMockDateFacetRequest();

    initDateFacet();
  });

  it('#initDateFacet throws an error when an manual range in the options is invalid', () => {
    options.currentValues = [
      buildDateRange({start: 1616679091000, end: 1616592691000}),
    ];
    expect(() => initDateFacet()).toThrow(
      'The start value is greater than the end value for the date range 2021/03/25@13:31:31 to 2021/03/24@13:31:31'
    );
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      dateFacetSet,
      configuration,
      search,
      relativeDateSet,
    });
  });

  it('calls #determineFacetId with the correct params', () => {
    jest.spyOn(FacetIdDeterminor, 'determineFacetId');

    initDateFacet();

    expect(FacetIdDeterminor.determineFacetId).toHaveBeenCalledWith(
      engine,
      options
    );
  });

  it('registers a date facet with the passed options', () => {
    const action = registerDateFacet({
      facetId,
      ...options,
      currentValues: [],
    });
    expect(engine.actions).toContainEqual(action);
  });

  it('when an option is invalid, it throws an error', () => {
    options.numberOfValues = 0;
    expect(() => initDateFacet()).toThrow(
      'Check the options of buildDateFacet'
    );
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

  it('exposes a #state getter property to retrieve the values', () => {
    const values = [buildMockDateFacetValue()];
    state.search.response.facets = [
      buildMockDateFacetResponse({facetId, values}),
    ];

    expect(dateFacet.state.values).toEqual(values);
  });
});
