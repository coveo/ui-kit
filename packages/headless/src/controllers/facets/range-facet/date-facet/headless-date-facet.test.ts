import {configuration} from '../../../../app/common-reducers.js';
import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions.js';
import {facetOptionsReducer as facetOptions} from '../../../../features/facet-options/facet-options-slice.js';
import {deselectAllFacetValues} from '../../../../features/facets/facet-set/facet-set-actions.js';
import {
  registerDateFacet,
  validateManualDateRanges,
} from '../../../../features/facets/range-facets/date-facet-set/date-facet-actions.js';
import {dateFacetSetReducer as dateFacetSet} from '../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice.js';
import type {DateFacetValue} from '../../../../features/facets/range-facets/date-facet-set/interfaces/response.js';
import {updateRangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/range-facet-actions.js';
import {executeSearch} from '../../../../features/search/search-actions.js';
import {searchReducer as search} from '../../../../features/search/search-slice.js';
import type {SearchAppState} from '../../../../state/search-app-state.js';
import {buildMockDateFacetResponse} from '../../../../test/mock-date-facet-response.js';
import {buildMockDateFacetSlice} from '../../../../test/mock-date-facet-slice.js';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../../test/mock-engine-v2.js';
import {createMockState} from '../../../../test/mock-state.js';
import * as FacetIdDeterminor from '../../../core/facets/_common/facet-id-determinor.js';
import {
  buildDateFacet,
  buildDateRange,
  type DateFacet,
  type DateFacetOptions,
} from './headless-date-facet.js';

vi.mock(
  '../../../../features/facets/range-facets/date-facet-set/date-facet-actions'
);
vi.mock('../../../../features/search/search-actions');
vi.mock('../../../../features/facets/facet-set/facet-set-actions');
vi.mock('../../../../features/facet-options/facet-options-actions');
vi.mock('../../../../features/facets/range-facets/generic/range-facet-actions');

describe('date facet', () => {
  const facetId = '1';
  let options: DateFacetOptions;
  let state: SearchAppState;
  let engine: MockedSearchEngine;
  let dateFacet: DateFacet;

  function initDateFacet() {
    engine = buildMockSearchEngine(state);
    dateFacet = buildDateFacet(engine, {options});
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'created',
      generateAutomaticRanges: true,
    };

    state = createMockState();
    state.dateFacetSet[facetId] = buildMockDateFacetSlice();

    initDateFacet();
  });

  it('#initDateFacet validates manual range in the options', () => {
    options.currentValues = [
      buildDateRange({start: 1616679091000, end: 1616592691000}),
    ];
    initDateFacet();
    expect(validateManualDateRanges).toHaveBeenCalledWith(
      expect.objectContaining({
        currentValues: [
          expect.objectContaining({
            start: '2021/03/25@22:16:31',
            end: '2021/03/24@22:16:31',
          }),
        ],
      })
    );
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      dateFacetSet,
      facetOptions,
      configuration,
      search,
    });
  });

  it('calls #determineFacetId with the correct params', () => {
    vi.spyOn(FacetIdDeterminor, 'determineFacetId');

    initDateFacet();

    expect(FacetIdDeterminor.determineFacetId).toHaveBeenCalledWith(
      engine,
      options
    );
  });

  it('registers a date facet with the passed options', () => {
    expect(registerDateFacet).toHaveBeenCalledWith({
      facetId,
      activeTab: '',
      tabs: {},
      currentValues: [],
      ...options,
    });
  });

  it('when an option is invalid, it throws an error', () => {
    options.numberOfValues = 0;
    expect(() => initDateFacet()).toThrow(
      'Check the options of buildDateFacet'
    );
  });

  describe('#toggleSelect', () => {
    it('dispatches a search', () => {
      const value = buildMockDateFacetValue();
      dateFacet.toggleSelect(value);
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#deselectAll', () => {
    beforeEach(() => dateFacet.deselectAll());

    it('dispatches #deselectAllFacetValues with the facet id', () => {
      expect(deselectAllFacetValues).toHaveBeenCalledWith(facetId);
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      expect(updateFacetOptions).toHaveBeenCalled();
    });

    it('dispatches a search', () => {
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#sortBy', () => {
    it('dispatches #updateRangeFacetSortCriterion', () => {
      const criterion = 'descending';
      dateFacet.sortBy(criterion);

      expect(updateRangeFacetSortCriterion).toHaveBeenCalledWith({
        facetId,
        criterion,
      });
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      dateFacet.sortBy('descending');
      expect(updateFacetOptions).toHaveBeenCalled();
    });

    it('dispatches a search', () => {
      dateFacet.sortBy('descending');
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  function testCommonToggleSingleSelect(facetValue: () => DateFacetValue) {
    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      dateFacet.toggleSingleSelect(facetValue());
      expect(updateFacetOptions).toHaveBeenCalled();
    });

    it('dispatches a search', () => {
      dateFacet.toggleSingleSelect(facetValue());
      expect(executeSearch).toHaveBeenCalled();
    });
  }

  describe('#toggleSingleSelect when the value state is "idle"', () => {
    const facetValue = () => buildMockDateFacetValue({state: 'idle'});

    testCommonToggleSingleSelect(facetValue);
  });

  describe('#toggleSingleSelect when the value state is not "idle"', () => {
    const facetValue = () => buildMockDateFacetValue({state: 'selected'});

    testCommonToggleSingleSelect(facetValue);
  });

  it('exposes a #state getter property to retrieve the values', () => {
    const values = [buildMockDateFacetValue()];
    state.search.response.facets = [
      buildMockDateFacetResponse({facetId, values}),
    ];

    expect(dateFacet.state.values).toEqual(values);
  });
});
