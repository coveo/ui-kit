import {
  NumericFacet,
  buildNumericFacet,
  NumericFacetOptions,
  buildNumericRange,
} from './headless-numeric-facet';
import {MockEngine, buildMockEngine} from '../../../test/mock-engine';
import {SearchPageState} from '../../../state';
import {createMockState} from '../../../test/mock-state';
import {executeSearch} from '../../../features/search/search-actions';
import {
  registerNumericFacet,
  toggleSelectNumericFacetValue,
} from '../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {buildMockNumericFacetValue} from '../../../test/mock-numeric-facet-value';
import {buildMockNumericFacetResponse} from '../../../test/mock-numeric-facet-response';

describe('range facet', () => {
  const facetId = '1';
  let options: NumericFacetOptions;
  let state: SearchPageState;
  let engine: MockEngine;
  let rangeFacet: NumericFacet;

  function initNumericFacet() {
    engine = buildMockEngine({state});
    rangeFacet = buildNumericFacet(engine, {options});
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'created',
      generateAutomaticRanges: true,
    };

    state = createMockState();

    initNumericFacet();
  });

  it('registers a numeric facet with the passed options', () => {
    const action = registerNumericFacet({facetId, ...options});
    expect(engine.actions).toContainEqual(action);
  });

  it('is subscribable', () => {
    expect(rangeFacet.subscribe).toBeDefined();
  });

  it('#state.values holds the response values', () => {
    const values = [buildMockNumericFacetValue()];
    const facet = buildMockNumericFacetResponse({facetId, values});
    state.search.response.facets = [facet];
    initNumericFacet();

    expect(rangeFacet.state.values).toEqual(values);
  });

  it('#toggleSelect dispatches a toggleSelectRangeFacetValue with the passed value', () => {
    const value = buildMockNumericFacetValue();
    rangeFacet.toggleSelect(value);

    const action = toggleSelectNumericFacetValue({facetId, selection: value});
    expect(engine.actions).toContainEqual(action);
  });

  it('#toggleSelect dispatches a search', () => {
    const value = buildMockNumericFacetValue();
    rangeFacet.toggleSelect(value);

    const action = engine.actions.find(
      (a) => a.type === executeSearch.pending.type
    );
    expect(action).toBeTruthy();
  });

  it('when the value is selected, #isValueSelected returns `true`', () => {
    const value = buildMockNumericFacetValue({state: 'selected'});
    expect(rangeFacet.isValueSelected(value)).toBe(true);
  });

  it('when the value is not selected, #isValueSelected returns `false`', () => {
    const value = buildMockNumericFacetValue({state: 'idle'});
    expect(rangeFacet.isValueSelected(value)).toBe(false);
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
