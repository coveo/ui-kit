import {configuration} from '../../../../../app/common-reducers';
import {facetOptionsReducer as facetOptions} from '../../../../../features/facet-options/facet-options-slice';
import {
  deselectAllDateFacetValues,
  registerDateFacet,
  validateManualDateRanges,
} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {
  executeToggleDateFacetExclude,
  executeToggleDateFacetSelect,
} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-controller-actions';
import {dateFacetSetReducer as dateFacetSet} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {DateFacetValue} from '../../../../../features/facets/range-facets/date-facet-set/interfaces/response';
import {searchReducer as search} from '../../../../../features/search/search-slice';
import {SearchAppState} from '../../../../../state/search-app-state';
import {buildMockDateFacetResponse} from '../../../../../test/mock-date-facet-response';
import {buildMockDateFacetSlice} from '../../../../../test/mock-date-facet-slice';
import {buildMockDateFacetValue} from '../../../../../test/mock-date-facet-value';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../../../../test/mock-engine-v2';
import {createMockState} from '../../../../../test/mock-state';
import * as FacetIdDeterminor from '../../_common/facet-id-determinor';
import {
  DateFacet,
  buildCoreDateFacet,
  DateFacetOptions,
  buildDateRange,
} from './headless-core-date-facet';

jest.mock('../../../../../features/facet-options/facet-options-actions');

jest.mock(
  '../../../../../features/facets/range-facets/date-facet-set/date-facet-controller-actions'
);

jest.mock(
  '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions'
);

describe('date facet', () => {
  const facetId = '1';
  let options: DateFacetOptions;
  let state: SearchAppState;
  let engine: MockedSearchEngine;
  let dateFacet: DateFacet;

  function initDateFacet() {
    engine = buildMockSearchEngine(state);
    dateFacet = buildCoreDateFacet(engine, {options});
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
          {
            end: '2021/03/24@22:16:31',
            endInclusive: false,
            start: '2021/03/25@22:16:31',
            state: 'idle',
          },
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
    jest.spyOn(FacetIdDeterminor, 'determineFacetId');

    initDateFacet();

    expect(FacetIdDeterminor.determineFacetId).toHaveBeenCalledWith(
      engine,
      options
    );
  });

  it('registers a date facet with the passed options', () => {
    expect(registerDateFacet).toHaveBeenCalledWith({
      facetId,
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
    it('dispatches an #executeToggleDateFacetSelect with the passed value', () => {
      const value = buildMockDateFacetValue();
      dateFacet.toggleSelect(value);
      expect(executeToggleDateFacetSelect).toHaveBeenCalledWith({
        facetId,
        selection: value,
      });
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches an #executeToggleDateFacetExclude with the passed value', () => {
      const value = buildMockDateFacetValue();
      dateFacet.toggleExclude(value);
      expect(executeToggleDateFacetExclude).toHaveBeenCalledWith({
        facetId,
        selection: value,
      });
    });
  });

  function testCommonToggleSingleSelect(facetValue: () => DateFacetValue) {
    it('dispatches an #executeToggleDateFacetSelect action with the passed facet value', () => {
      dateFacet.toggleSingleSelect(facetValue());
      expect(executeToggleDateFacetSelect).toHaveBeenCalledWith({
        facetId,
        selection: facetValue(),
      });
    });
  }

  describe('#toggleSingleSelect when the value state is "idle"', () => {
    const facetValue = () => buildMockDateFacetValue({state: 'idle'});

    testCommonToggleSingleSelect(facetValue);

    it('dispatches an #executeToggleDateFacetSelect action', () => {
      dateFacet.toggleSingleSelect(facetValue());
      expect(executeToggleDateFacetSelect).toHaveBeenCalledWith(
        expect.objectContaining({facetId})
      );
    });
  });

  describe('#toggleSingleSelect when the value state is not "idle"', () => {
    const selectedFacetValue = () =>
      buildMockDateFacetValue({state: 'selected'});
    const excludedFacetValue = () =>
      buildMockDateFacetValue({state: 'excluded'});

    testCommonToggleSingleSelect(selectedFacetValue);
    testCommonToggleSingleSelect(excludedFacetValue);

    it('does not dispatch a #deselectAllFacetValues action', () => {
      dateFacet.toggleSingleSelect(selectedFacetValue());
      expect(deselectAllDateFacetValues).not.toHaveBeenCalled();
    });
  });

  function testCommonToggleExcludeSelect(facetValue: () => DateFacetValue) {
    it('dispatches an #executeToggleDateFacetExclude with the passed facet value', () => {
      dateFacet.toggleSingleExclude(facetValue());
      expect(executeToggleDateFacetExclude).toHaveBeenCalledWith({
        facetId,
        selection: facetValue(),
      });
    });
  }

  describe('#toggleSingleExclude when the value state is "idle"', () => {
    const facetValue = () => buildMockDateFacetValue({state: 'idle'});

    testCommonToggleExcludeSelect(facetValue);
  });

  describe('#toggleSingleExclude when the value state is not "idle"', () => {
    const selectedFacetValue = () =>
      buildMockDateFacetValue({state: 'selected'});
    const excludedFacetValue = () =>
      buildMockDateFacetValue({state: 'excluded'});

    testCommonToggleExcludeSelect(selectedFacetValue);
    testCommonToggleExcludeSelect(excludedFacetValue);

    it('does not dispatch a #deselectAllFacetValues action', () => {
      dateFacet.toggleSingleSelect(selectedFacetValue());
      expect(deselectAllDateFacetValues).not.toHaveBeenCalled();
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
