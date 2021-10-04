import {
  NumericFacet,
  buildNumericFacet,
  NumericFacetOptions,
} from './headless-product-listing-numeric-facet';
import {
  MockProductListingEngine,
  buildMockProductListingEngine,
} from '../../../../test/mock-engine';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import {buildMockNumericFacetRequest} from '../../../../test/mock-numeric-facet-request';
import {configuration, numericFacetSet, search} from '../../../../app/reducers';
import {NumericFacetValue} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {buildMockProductListingState} from '../../../../test/mock-product-listing-state';
import {ProductListingAppState} from '../../../../state/product-listing-app-state';
import {fetchProductListing} from '../../../../features/product-listing/product-listing-actions';

describe('numeric facet', () => {
  const facetId = '1';
  let options: NumericFacetOptions;
  let state: ProductListingAppState;
  let engine: MockProductListingEngine;
  let numericFacet: NumericFacet;

  beforeEach(() => {
    options = {
      facetId,
      field: 'created',
      generateAutomaticRanges: true,
    };

    state = buildMockProductListingState();
    state.numericFacetSet[facetId] = buildMockNumericFacetRequest();

    engine = buildMockProductListingEngine({state});
    numericFacet = buildNumericFacet(engine, {options});
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      numericFacetSet,
      configuration,
      search,
    });
  });

  describe('#toggleSelect', () => {
    it('dispatches #fetchProductListing', () => {
      const value = buildMockNumericFacetValue();
      numericFacet.toggleSelect(value);

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });
  });

  describe('#deselectAll', () => {
    it('dispatches #fetchProductListing', () => {
      numericFacet.deselectAll();

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });
  });

  describe('#sortBy', () => {
    it('dispatches #fetchProductListing', () => {
      numericFacet.sortBy('descending');

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });
  });

  function testCommonToggleSingleSelect(facetValue: () => NumericFacetValue) {
    it('dispatches #fetchProductListing', () => {
      numericFacet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });
  }

  describe('#toggleSingleSelect when the value state is "idle"', () => {
    const facetValue = () => buildMockNumericFacetValue({state: 'idle'});

    testCommonToggleSingleSelect(facetValue);
  });

  describe('#toggleSingleSelect when the value state is not "idle"', () => {
    const facetValue = () => buildMockNumericFacetValue({state: 'selected'});

    testCommonToggleSingleSelect(facetValue);
  });
});
