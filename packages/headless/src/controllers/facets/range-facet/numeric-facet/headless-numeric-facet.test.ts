import {configuration} from '../../../../app/common-reducers.js';
import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions.js';
import {deselectAllFacetValues} from '../../../../features/facets/facet-set/facet-set-actions.js';
import {updateRangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/range-facet-actions.js';
import type {NumericFacetValue} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/response.js';
import * as numericFacetActions from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions.js';
import {
  registerNumericFacet,
  validateManualNumericRanges,
} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions.js';
import {executeToggleNumericFacetSelect} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-controller-actions.js';
import {numericFacetSetReducer as numericFacetSet} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice.js';
import {executeSearch} from '../../../../features/search/search-actions.js';
import {searchReducer as search} from '../../../../features/search/search-slice.js';
import type {SearchAppState} from '../../../../state/search-app-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../../test/mock-engine-v2.js';
import {buildMockNumericFacetResponse} from '../../../../test/mock-numeric-facet-response.js';
import {buildMockNumericFacetSlice} from '../../../../test/mock-numeric-facet-slice.js';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value.js';
import {createMockState} from '../../../../test/mock-state.js';
import * as FacetIdDeterminor from '../../../core/facets/_common/facet-id-determinor.js';
import {
  buildNumericFacet,
  buildNumericRange,
  type NumericFacet,
  type NumericFacetOptions,
} from './headless-numeric-facet.js';

vi.mock('../../../../features/facet-options/facet-options-actions');
vi.mock('../../../../features/facets/facet-set/facet-set-actions');
vi.mock(
  '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions'
);
vi.mock('../../../../features/facets/range-facets/generic/range-facet-actions');
vi.mock('../../../../features/search/search-actions');

vi.mock(
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

  afterEach(() => {
    vi.clearAllMocks();
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
    vi.spyOn(FacetIdDeterminor, 'determineFacetId');

    initNumericFacet();

    expect(FacetIdDeterminor.determineFacetId).toHaveBeenCalledWith(
      engine,
      options
    );
  });

  it('registers a numeric facet with the passed options', () => {
    expect(registerNumericFacet).toHaveBeenCalledWith({
      facetId,
      activeTab: '',
      tabs: {},
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
      const spy = vi.spyOn(
        numericFacetActions,
        'deselectAllNumericFacetValues'
      );
      numericFacet.toggleSingleSelect(facetValue());

      expect(spy).not.toHaveBeenCalled();
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
