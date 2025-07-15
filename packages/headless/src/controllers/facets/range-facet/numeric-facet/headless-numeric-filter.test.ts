import type {Mock} from 'vitest';
import {configuration} from '../../../../app/common-reducers.js';
import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions.js';
import {
  registerNumericFacet,
  updateNumericFacetValues,
  validateManualNumericRanges,
} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions.js';
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
import {buildNumericRange} from '../../../core/facets/range-facet/numeric-facet/numeric-range.js';
import {
  buildNumericFilter,
  type NumericFilter,
  type NumericFilterInitialState,
  type NumericFilterOptions,
} from './headless-numeric-filter.js';

vi.mock('../../../../features/search/search-actions');
vi.mock('../../../../features/facet-options/facet-options-actions');
vi.mock(
  '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions'
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
    numericFacet = buildNumericFilter(engine, {options, initialState});
  }

  beforeEach(() => {
    initialState = undefined;

    options = {
      facetId,
      field: 'created',
    };

    state = createMockState();
    state.numericFacetSet[facetId] = buildMockNumericFacetSlice();

    initNumericFilter();
  });

  it('#initNumericFacet throws an error when an manual range is invalid', () => {
    initialState = {
      range: buildNumericRange({
        start: 10,
        end: 0,
      }),
    };
    initNumericFilter();
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
    beforeEach(() => {
      (updateNumericFacetValues as unknown as Mock).mockReturnValueOnce({});
    });
    it('dispatches a updateNumericFacetValues with the passed value', () => {
      const value = buildMockNumericFacetValue({});
      numericFacet.setRange(value);
      expect(updateNumericFacetValues).toHaveBeenCalledWith({
        facetId,
        values: [
          {
            ...value,
            state: 'selected',
            numberOfResults: 0,
            endInclusive: true,
          },
        ],
      });
    });

    it('dispatches a search', () => {
      const value = buildMockNumericFacetValue();
      numericFacet.setRange(value);
      expect(executeSearch).toHaveBeenCalled();
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

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      expect(updateFacetOptions).toHaveBeenCalledWith();
    });

    it('dispatches a search', () => {
      expect(executeSearch).toHaveBeenCalled();
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
