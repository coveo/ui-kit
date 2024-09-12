import {configuration} from '../../../../../app/common-reducers';
import {facetOptionsReducer as facetOptions} from '../../../../../features/facet-options/facet-options-slice';
import {deselectAllFacetValues} from '../../../../../features/facets/facet-set/facet-set-actions';
import {NumericFacetValue} from '../../../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {
  deselectAllNumericFacetValues,
  registerNumericFacet,
  validateManualNumericRanges,
} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {executeToggleNumericFacetSelect} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-controller-actions';
import {numericFacetSetReducer as numericFacetSet} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {searchReducer as search} from '../../../../../features/search/search-slice';
import {SearchAppState} from '../../../../../state/search-app-state';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../../../../test/mock-engine-v2';
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

jest.mock(
  '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions'
);

jest.mock('../../../../../features/facet-options/facet-options-actions');

jest.mock(
  '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-controller-actions'
);

jest.mock('../../../../../features/facets/facet-set/facet-set-actions');

describe('numeric facet', () => {
  const facetId = '1';
  let options: NumericFacetOptions;
  let state: SearchAppState;
  let engine: MockedSearchEngine;
  let numericFacet: NumericFacet;

  function initNumericFacet() {
    engine = buildMockSearchEngine(state);
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

  it('#initNumericFacet validates manual range', () => {
    options.currentValues = [
      buildNumericRange({
        start: 10,
        end: 0,
      }),
    ];
    initNumericFacet();
    expect(validateManualNumericRanges).toHaveBeenCalledWith(
      expect.objectContaining({
        currentValues: [
          {
            start: 10,
            end: 0,
            endInclusive: false,
            state: 'idle',
          },
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
    it('dispatches an #executeToggleNumericFacetSelect action with the passed facet value', () => {
      const value = buildMockNumericFacetValue();
      numericFacet.toggleSelect(value);
      expect(executeToggleNumericFacetSelect).toHaveBeenCalledWith({
        facetId,
        selection: value,
      });
    });
  });

  function testCommonToggleSingleSelect(facetValue: () => NumericFacetValue) {
    it('dispatches an #executeToggleNumericFacetSelect action with the passed facet value', () => {
      numericFacet.toggleSingleSelect(facetValue());

      expect(executeToggleNumericFacetSelect).toHaveBeenCalledWith({
        facetId,
        selection: facetValue(),
      });
    });
  }

  describe('#toggleSingleSelect when the value state is "idle"', () => {
    const facetValue = () => buildMockNumericFacetValue({state: 'idle'});

    testCommonToggleSingleSelect(facetValue);

    it('dispatches a #deselectAllFacetValues action', () => {
      numericFacet.toggleSingleSelect(facetValue());
      expect(deselectAllFacetValues).toHaveBeenCalledWith(facetId);
    });
  });

  describe('#toggleSingleSelect when the value state is not "idle"', () => {
    const facetValue = () => buildMockNumericFacetValue({state: 'selected'});

    testCommonToggleSingleSelect(facetValue);

    it('does not dispatch a #deselectAllNumericFacetValues action', () => {
      numericFacet.toggleSingleSelect(facetValue());
      expect(deselectAllNumericFacetValues).not.toHaveBeenCalledWith(facetId);
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
