import {configuration} from '../../../../app/common-reducers';
import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions';
import {deselectAllFacetValues} from '../../../../features/facets/facet-set/facet-set-actions';
import {updateRangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/range-facet-actions';
import {NumericFacetValue} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {
  deselectAllNumericFacetValues,
  registerNumericFacet,
  validateManualNumericRanges,
} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {executeToggleNumericFacetSelect} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-controller-actions';
import {numericFacetSetReducer as numericFacetSet} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {executeSearch} from '../../../../features/search/search-actions';
import {searchReducer as search} from '../../../../features/search/search-slice';
import {SearchAppState} from '../../../../state/search-app-state';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../../../test/mock-engine-v2';
import {buildMockNumericFacetResponse} from '../../../../test/mock-numeric-facet-response';
import {buildMockNumericFacetSlice} from '../../../../test/mock-numeric-facet-slice';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import {createMockState} from '../../../../test/mock-state';
import * as FacetIdDeterminor from '../../../core/facets/_common/facet-id-determinor';
import {
  NumericFacet,
  buildNumericFacet,
  NumericFacetOptions,
  buildNumericRange,
} from './headless-numeric-facet';

jest.mock('../../../../features/facet-options/facet-options-actions');
jest.mock('../../../../features/facets/facet-set/facet-set-actions');
jest.mock(
  '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions'
);
jest.mock(
  '../../../../features/facets/range-facets/generic/range-facet-actions'
);
jest.mock('../../../../features/search/search-actions');

jest.mock(
  '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-controller-actions'
);

describe('numeric facet', () => {
  const facetId = '1';
  let options: NumericFacetOptions;
  let state: SearchAppState;
  let engine: MockedSearchEngine;
  let numericFacet: NumericFacet;

  function initNumericFacet() {
    engine = buildMockSearchEngine(state);
    numericFacet = buildNumericFacet(engine, {options});
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'created',
      generateAutomaticRanges: true,
    };

    state = createMockState();
    state.numericFacetSet[facetId] = buildMockNumericFacetSlice();

    initNumericFacet();
  });

  it('#initNumericFacet validate manual range', () => {
    options.currentValues = [
      buildNumericRange({
        start: 10,
        end: 0,
      }),
    ];

    initNumericFacet();
    expect(validateManualNumericRanges).toHaveBeenCalledWith(
      expect.objectContaining({
        currentValues: expect.arrayContaining([
          expect.objectContaining({start: 10, end: 0}),
        ]),
      })
    );
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      numericFacetSet,
      configuration,
      search,
    });
  });

  it('calls #determineFacetId with the correct params', () => {
    jest.spyOn(FacetIdDeterminor, 'determineFacetId');

    initNumericFacet();

    expect(FacetIdDeterminor.determineFacetId).toHaveBeenCalledWith(
      engine,
      options
    );
  });

  it('registers a numeric facet with the passed options', () => {
    expect(registerNumericFacet).toHaveBeenCalledWith({
      facetId,
      currentValues: [],
      ...options,
    });
  });

  it('when an option is invalid, it throws an error', () => {
    options.numberOfValues = 0;
    expect(() => initNumericFacet()).toThrow(
      'Check the options of buildNumericFacet'
    );
  });

  describe('#toggleSelect', () => {
    it('dispatches a executeToggleNumericFacetSelect with the passed value', () => {
      const value = buildMockNumericFacetValue();
      numericFacet.toggleSelect(value);

      expect(executeToggleNumericFacetSelect).toHaveBeenCalledWith({
        facetId,
        selection: value,
      });
    });

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
      numericFacet.sortBy(criterion);

      expect(updateRangeFacetSortCriterion).toHaveBeenCalledWith({
        facetId,
        criterion,
      });
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      numericFacet.sortBy('descending');
      expect(updateFacetOptions).toHaveBeenCalled();
    });

    it('dispatches a search', () => {
      numericFacet.sortBy('descending');
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  function testCommonToggleSingleSelect(facetValue: () => NumericFacetValue) {
    it('dispatches a #toggleSelect action with the passed facet value', () => {
      numericFacet.toggleSingleSelect(facetValue());
      expect(executeToggleNumericFacetSelect).toHaveBeenCalledWith({
        facetId,
        selection: facetValue(),
      });
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      numericFacet.toggleSingleSelect(facetValue());
      expect(updateFacetOptions).toHaveBeenCalled();
    });

    it('dispatches a search', () => {
      numericFacet.toggleSingleSelect(facetValue());

      expect(executeSearch).toHaveBeenCalled();
    });
  }

  describe('#toggleSingleSelect when the value state is "idle"', () => {
    const facetValue = () => buildMockNumericFacetValue({state: 'idle'});

    testCommonToggleSingleSelect(facetValue);

    it('dispatches a #deselectAllFacetValues action', () => {
      numericFacet.toggleSingleSelect(facetValue());

      expect(deselectAllFacetValues).toHaveBeenCalled();
    });
  });

  describe('#toggleSingleSelect when the value state is not "idle"', () => {
    const facetValue = () => buildMockNumericFacetValue({state: 'selected'});

    testCommonToggleSingleSelect(facetValue);

    it('does not dispatch a #deselectAllFacetValues action', () => {
      numericFacet.toggleSingleSelect(facetValue());

      expect(deselectAllNumericFacetValues).not.toHaveBeenCalled();
    });
  });

  it('exposes a #state getter property to retrieve the values', () => {
    const values = [buildMockNumericFacetValue()];
    state.search.response.facets = [
      buildMockNumericFacetResponse({facetId, values}),
    ];

    expect(numericFacet.state.values).toEqual(values);
  });

  it('#buildNumericRange builds a range with the expected required and default values', () => {
    const range = buildNumericRange({start: 0, end: 100});

    expect(range).toEqual({
      start: 0,
      end: 100,
      endInclusive: false,
      state: 'idle',
    });
  });
});
