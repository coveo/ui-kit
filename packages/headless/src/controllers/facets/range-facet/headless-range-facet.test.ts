import {MockEngine, buildMockEngine} from '../../../test/mock-engine';
import {SearchPageState} from '../../../state';
import {createMockState} from '../../../test/mock-state';
import {executeSearch} from '../../../features/search/search-actions';
import {buildMockNumericFacetValue} from '../../../test/mock-numeric-facet-value';
import {buildMockNumericFacetResponse} from '../../../test/mock-numeric-facet-response';
import {buildRangeFacet} from './headless-range-facet';

describe('range facet', () => {
  const facetId = '1';
  let state: SearchPageState;
  let engine: MockEngine;
  let rangeFacet: ReturnType<typeof buildRangeFacet>;

  function initNumericFacet() {
    engine = buildMockEngine({state});
    rangeFacet = buildRangeFacet(engine, facetId);
  }

  beforeEach(() => {
    state = createMockState();
    initNumericFacet();
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
});
