import type {Mock} from 'vitest';
import {configuration} from '../../../../../app/common-reducers.js';
import {facetOptionsReducer as facetOptions} from '../../../../../features/facet-options/facet-options-slice.js';
import {
  registerNumericFacet,
  updateNumericFacetValues,
  validateManualNumericRanges,
} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions.js';
import {numericFacetSetReducer as numericFacetSet} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice.js';
import {searchReducer as search} from '../../../../../features/search/search-slice.js';
import type {SearchAppState} from '../../../../../state/search-app-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../../../test/mock-engine-v2.js';
import {buildMockNumericFacetResponse} from '../../../../../test/mock-numeric-facet-response.js';
import {buildMockNumericFacetSlice} from '../../../../../test/mock-numeric-facet-slice.js';
import {buildMockNumericFacetValue} from '../../../../../test/mock-numeric-facet-value.js';
import {createMockState} from '../../../../../test/mock-state.js';
import * as FacetIdDeterminor from '../../_common/facet-id-determinor.js';
import {
  buildCoreNumericFilter,
  type NumericFilter,
  type NumericFilterInitialState,
  type NumericFilterOptions,
} from './headless-core-numeric-filter.js';
import {buildNumericRange} from './numeric-range.js';

vi.mock(
  '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions'
);

describe('numeric filter', () => {
  const facetId = '1';
  let options: NumericFilterOptions;
  let initialState: NumericFilterInitialState | undefined;
  let state: SearchAppState;
  let engine: MockedSearchEngine;
  let numericFacet: NumericFilter;

  function initNumericFilter() {
    engine = buildMockSearchEngine(state);
    numericFacet = buildCoreNumericFilter(engine, {options, initialState});
  }

  beforeEach(() => {
    (updateNumericFacetValues as unknown as Mock).mockImplementation(
      () => () => {}
    );
    initialState = undefined;

    options = {
      facetId,
      field: 'created',
    };

    state = createMockState();
    state.numericFacetSet[facetId] = buildMockNumericFacetSlice();

    initNumericFilter();
  });

  it('#initNumericFacet validates manual range', () => {
    initialState = {
      range: buildNumericRange({
        start: 10,
        end: 0,
      }),
    };
    initNumericFilter();
    expect(validateManualNumericRanges).toHaveBeenCalledWith(
      expect.objectContaining({
        currentValues: [
          {end: 0, endInclusive: true, start: 10, state: 'selected'},
        ],
      })
    );
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      numericFacetSet,
      facetOptions,
      configuration,
      search,
    });
  });

  it('calls #determineFacetId with the correct params', () => {
    vi.spyOn(FacetIdDeterminor, 'determineFacetId');

    initNumericFilter();

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
      generateAutomaticRanges: false,
      currentValues: initialState?.range
        ? [{...initialState.range, endInclusive: true, state: 'selected'}]
        : [],
      ...options,
    });
  });

  it('when an option is invalid, it throws an error', () => {
    options.field = 0 as unknown as string;
    expect(() => initNumericFilter()).toThrow(
      'Check the options of buildNumericFacet'
    );
  });

  describe('#setRange', () => {
    it('dispatches a updateNumericFacetValues with the passed value', () => {
      const value = buildMockNumericFacetValue({});
      numericFacet.setRange(value);

      expect(updateNumericFacetValues).toHaveBeenCalledWith({
        facetId,
        values: [
          {...value, state: 'selected', numberOfResults: 0, endInclusive: true},
        ],
      });
    });

    it('should return true when range is valid', () => {
      const value = buildMockNumericFacetValue({start: 5, end: 10});
      expect(numericFacet.setRange(value)).toBe(true);
    });

    it('should return false when range start value is greater than range end value', () => {
      const value = buildMockNumericFacetValue({start: 10, end: 5});
      (updateNumericFacetValues as unknown as Mock).mockImplementationOnce(
        () => {
          return {
            error: 'oh no',
          };
        }
      );

      expect(numericFacet.setRange(value)).toBe(false);
    });
  });

  describe('#clear', () => {
    beforeEach(() => numericFacet.clear());

    it('dispatches #updateNumericFacetValues with the facet id and an empty array', () => {
      expect(updateNumericFacetValues).toHaveBeenCalledWith({
        facetId,
        values: [],
      });
    });
  });

  it('the state #range property should return the range if it is selected', () => {
    const value = buildMockNumericFacetValue({state: 'selected'});
    state.search.response.facets = [
      buildMockNumericFacetResponse({facetId, values: [value]}),
    ];

    expect(numericFacet.state.range).toEqual(value);
  });

  it('the state #range property should not return the range if it is not selected', () => {
    const value = buildMockNumericFacetValue({state: 'idle'});
    state.search.response.facets = [
      buildMockNumericFacetResponse({facetId, values: [value]}),
    ];

    expect(numericFacet.state.range).toBeUndefined();
  });

  it('#state.facetId exposes the facet id', () => {
    expect(numericFacet.state.facetId).toBe(facetId);
  });
});
