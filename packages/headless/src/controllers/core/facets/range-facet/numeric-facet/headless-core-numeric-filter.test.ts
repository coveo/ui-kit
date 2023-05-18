import {configuration} from '../../../../../app/common-reducers';
import {updateFacetOptions} from '../../../../../features/facet-options/facet-options-actions';
import {facetOptionsReducer as facetOptions} from '../../../../../features/facet-options/facet-options-slice';
import {
  registerNumericFacet,
  updateNumericFacetValues,
} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {numericFacetSetReducer as numericFacetSet} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {searchReducer as search} from '../../../../../features/search/search-slice';
import {SearchAppState} from '../../../../../state/search-app-state';
import {
  buildMockSearchAppEngine,
  createMockState,
  MockSearchEngine,
} from '../../../../../test';
import {buildMockNumericFacetResponse} from '../../../../../test/mock-numeric-facet-response';
import {buildMockNumericFacetSlice} from '../../../../../test/mock-numeric-facet-slice';
import {buildMockNumericFacetValue} from '../../../../../test/mock-numeric-facet-value';
import * as FacetIdDeterminor from '../../_common/facet-id-determinor';
import {
  buildCoreNumericFilter,
  NumericFilter,
  NumericFilterInitialState,
  NumericFilterOptions,
} from './headless-core-numeric-filter';
import {buildNumericRange} from './numeric-range';

describe('numeric filter', () => {
  const facetId = '1';
  let options: NumericFilterOptions;
  let initialState: NumericFilterInitialState | undefined;
  let state: SearchAppState;
  let engine: MockSearchEngine;
  let numericFacet: NumericFilter;

  function initNumericFilter() {
    engine = buildMockSearchAppEngine({state});
    numericFacet = buildCoreNumericFilter(engine, {options, initialState});
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
    expect(() => initNumericFilter()).toThrow(
      'The start value is greater than the end value for the numeric range 10 to 0'
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
    jest.spyOn(FacetIdDeterminor, 'determineFacetId');

    initNumericFilter();

    expect(FacetIdDeterminor.determineFacetId).toHaveBeenCalledWith(
      engine,
      options
    );
  });

  it('registers a numeric facet with the passed options', () => {
    const action = registerNumericFacet({
      facetId,
      generateAutomaticRanges: false,
      currentValues: initialState?.range
        ? [{...initialState.range, endInclusive: true, state: 'selected'}]
        : [],
      ...options,
    });
    expect(engine.actions).toContainEqual(action);
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

      const action = updateNumericFacetValues({
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
      expect(engine.actions).toContainEqual(action);
    });

    it('should return true when range is valid', () => {
      const value = buildMockNumericFacetValue({start: 5, end: 10});
      expect(numericFacet.setRange(value)).toBe(true);
    });

    it('should return false when range start value is greater than range end value', () => {
      const value = buildMockNumericFacetValue({start: 10, end: 5});
      expect(numericFacet.setRange(value)).toBe(false);
    });
  });

  describe('#clear', () => {
    beforeEach(() => numericFacet.clear());

    it('dispatches #updateNumericFacetValues with the facet id and an empty array', () => {
      expect(engine.actions).toContainEqual(
        updateNumericFacetValues({facetId, values: []})
      );
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
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
