import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {restoreProductListingParameters} from '../../product-listing-parameters/product-listing-parameters-actions.js';
import {restoreSearchParameters} from '../../search-parameters/search-parameters-actions.js';
import {
  clearAllCoreFacets,
  deselectAllValuesInCoreFacet,
} from '../core-facet/core-facet-actions.js';
import {manualNumericFacetReducer} from './manual-numeric-facet-slice.js';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
  updateManualNumericFacetRange,
} from './numeric-facet-actions.js';

describe('manualNumericFacetSlice', () => {
  const someManualRange = {
    start: 1,
    end: 2,
    endInclusive: false,
    state: 'selected' as const,
  };
  it('should #updateManualNumericFacetRange', () => {
    const state = buildMockCommerceState();

    const finalState = manualNumericFacetReducer(
      state.manualNumericFacetSet,
      updateManualNumericFacetRange({
        facetId: 'some-facet',
        ...someManualRange,
      })
    );

    expect(finalState).toEqual({'some-facet': {manualRange: someManualRange}});
  });

  it.each([
    {
      action: toggleExcludeNumericFacetValue,
      name: 'toggleExcludeNumericFacetValue',
    },
    {
      action: toggleSelectNumericFacetValue,
      name: 'toggleSelectNumericFacetValue',
    },
    {
      action: deselectAllValuesInCoreFacet,
      name: 'deselectAllValuesInCoreFacet',
    },
  ])('should clear manual range when "$name" is dispatched', ({action}) => {
    const state = buildMockCommerceState({
      manualNumericFacetSet: {
        'some-facet': {
          manualRange: someManualRange,
        },
      },
    });

    const finalState = manualNumericFacetReducer(
      state.manualNumericFacetSet,
      action({
        facetId: 'some-facet',
      } as never)
    );

    expect(finalState).toEqual({'some-facet': {manualRange: undefined}});
  });

  it.each([
    {action: restoreSearchParameters, name: 'restoreSearchParameters'},
    {
      action: restoreProductListingParameters,
      name: 'restoreProductListingParameters',
    },
  ])('should restore manual range when "$name" is dispatched', ({action}) => {
    const state = buildMockCommerceState();

    const finalState = manualNumericFacetReducer(
      state.manualNumericFacetSet,
      action({
        mnf: {
          'some-facet': [someManualRange],
        },
      })
    );

    expect(finalState).toEqual({'some-facet': {manualRange: someManualRange}});
  });

  it('should clear all manual ranges when #clearAllCoreFacets is dispatched', () => {
    const state = buildMockCommerceState({
      manualNumericFacetSet: {
        'some-facet': {
          manualRange: someManualRange,
        },
        'some-other-facet': {
          manualRange: someManualRange,
        },
      },
    });

    const finalState = manualNumericFacetReducer(
      state.manualNumericFacetSet,
      clearAllCoreFacets()
    );

    expect(finalState).toEqual({
      'some-facet': {manualRange: undefined},
      'some-other-facet': {manualRange: undefined},
    });
  });
});
