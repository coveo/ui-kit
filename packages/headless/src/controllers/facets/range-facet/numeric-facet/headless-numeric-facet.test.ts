import {
  NumericFacet,
  buildNumericFacet,
  NumericFacetOptions,
  buildNumericRange,
} from './headless-numeric-facet';
import {
  MockEngine,
  buildMockSearchAppEngine,
} from '../../../../test/mock-engine';
import {createMockState} from '../../../../test/mock-state';
import {executeSearch} from '../../../../features/search/search-actions';
import {
  registerNumericFacet,
  toggleSelectNumericFacetValue,
} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import {buildMockNumericFacetResponse} from '../../../../test/mock-numeric-facet-response';
import {buildMockNumericFacetRequest} from '../../../../test/mock-numeric-facet-request';
import {SearchAppState} from '../../../../state/search-app-state';

describe('numeric facet', () => {
  const facetId = '1';
  let options: NumericFacetOptions;
  let state: SearchAppState;
  let engine: MockEngine<SearchAppState>;
  let numericFacet: NumericFacet;

  function initNumericFacet() {
    engine = buildMockSearchAppEngine({state});
    numericFacet = buildNumericFacet(engine, {options});
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'created',
      generateAutomaticRanges: true,
    };

    state = createMockState();
    state.numericFacetSet[facetId] = buildMockNumericFacetRequest();

    initNumericFacet();
  });

  it('registers a numeric facet with the passed options', () => {
    const action = registerNumericFacet({facetId, ...options});
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

    it('dispatches a search', () => {
      const value = buildMockNumericFacetValue();
      numericFacet.toggleSelect(value);

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
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
