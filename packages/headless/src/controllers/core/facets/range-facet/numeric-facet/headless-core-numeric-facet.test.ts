import {configuration} from '../../../../../app/common-reducers';
import {updateFacetOptions} from '../../../../../features/facet-options/facet-options-actions';
import {facetOptionsReducer as facetOptions} from '../../../../../features/facet-options/facet-options-slice';
import {NumericFacetValue} from '../../../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {
  deselectAllNumericFacetValues,
  registerNumericFacet,
  toggleSelectNumericFacetValue,
} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {numericFacetSetReducer as numericFacetSet} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {searchReducer as search} from '../../../../../features/search/search-slice';
import {SearchAppState} from '../../../../../state/search-app-state';
import {
  MockSearchEngine,
  buildMockSearchAppEngine,
} from '../../../../../test/mock-engine';
import {buildMockNumericFacetResponse} from '../../../../../test/mock-numeric-facet-response';
import {buildMockNumericFacetSlice} from '../../../../../test/mock-numeric-facet-slice';
import {buildMockNumericFacetValue} from '../../../../../test/mock-numeric-facet-value';
import {createMockState} from '../../../../../test/mock-state';
import * as FacetIdDeterminor from '../../_common/facet-id-determinor';
import {
  NumericFacet,
  buildCoreNumericFacet,
  NumericFacetOptions,
  buildNumericRange,
} from './headless-core-numeric-facet';

describe('numeric facet', () => {
  const facetId = '1';
  let options: NumericFacetOptions;
  let state: SearchAppState;
  let engine: MockSearchEngine;
  let numericFacet: NumericFacet;

  function initNumericFacet() {
    engine = buildMockSearchAppEngine({state});
    numericFacet = buildCoreNumericFacet(engine, {options});
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

  it('#initNumericFacet throws an error when an manual range is invalid', () => {
    options.currentValues = [
      buildNumericRange({
        start: 10,
        end: 0,
      }),
    ];
    expect(() => initNumericFacet()).toThrow(
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

    initNumericFacet();

    expect(FacetIdDeterminor.determineFacetId).toHaveBeenCalledWith(
      engine,
      options
    );
  });

  it('registers a numeric facet with the passed options', () => {
    const action = registerNumericFacet({
      facetId,
      currentValues: [],
      ...options,
    });
    expect(engine.actions).toContainEqual(action);
  });

  it('when an option is invalid, it throws an error', () => {
    options.numberOfValues = 0;
    expect(() => initNumericFacet()).toThrow(
      'Check the options of buildNumericFacet'
    );
  });

  describe('#toggleSelect', () => {
    it('dispatches a toggleSelectNumericFacetValue with the passed value', () => {
      const value = buildMockNumericFacetValue();
      numericFacet.toggleSelect(value);

      const action = toggleSelectNumericFacetValue({facetId, selection: value});
      expect(engine.actions).toContainEqual(action);
    });
  });

  function testCommonToggleSingleSelect(facetValue: () => NumericFacetValue) {
    it('dispatches a #toggleSelect action with the passed facet value', () => {
      numericFacet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        toggleSelectNumericFacetValue({facetId, selection: facetValue()})
      );
    });

    it('dispatches #updateFacetOptions with #freezeFacetOrder true', () => {
      numericFacet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        updateFacetOptions({freezeFacetOrder: true})
      );
    });
  }

  describe('#toggleSingleSelect when the value state is "idle"', () => {
    const facetValue = () => buildMockNumericFacetValue({state: 'idle'});

    testCommonToggleSingleSelect(facetValue);

    it('dispatches a #deselectAllFacetValues action', () => {
      numericFacet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        deselectAllNumericFacetValues(facetId)
      );
    });
  });

  describe('#toggleSingleSelect when the value state is not "idle"', () => {
    const facetValue = () => buildMockNumericFacetValue({state: 'selected'});

    testCommonToggleSingleSelect(facetValue);

    it('does not dispatch a #deselectAllFacetValues action', () => {
      numericFacet.toggleSingleSelect(facetValue());

      expect(engine.actions).not.toContainEqual(
        deselectAllNumericFacetValues(facetId)
      );
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
