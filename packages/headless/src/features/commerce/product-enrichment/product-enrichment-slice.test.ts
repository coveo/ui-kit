import {
  buildFetchBadgesResponse,
  buildMockBadge,
  buildMockBadgePlacement,
  buildMockBadgesProduct,
} from '../../../test/mock-product-enrichment.js';
import {
  fetchBadges,
  registerProductEnrichmentOptions,
} from './product-enrichment-actions.js';
import {productEnrichmentReducer} from './product-enrichment-slice.js';
import {
  getProductEnrichmentInitialState,
  type ProductEnrichmentState,
} from './product-enrichment-state.js';

describe('product-enrichment-slice', () => {
  let state: ProductEnrichmentState;

  beforeEach(() => {
    state = getProductEnrichmentInitialState();
  });

  it('should have an initial state', () => {
    expect(productEnrichmentReducer(undefined, {type: ''})).toEqual(
      getProductEnrichmentInitialState()
    );
  });

  describe('on #registerProductEnrichmentOptions', () => {
    it('sets #productId from payload', () => {
      const action = registerProductEnrichmentOptions({
        productId: 'product-123',
        placementIds: ['placement-1'],
      });
      const finalState = productEnrichmentReducer(state, action);

      expect(finalState.productId).toBe('product-123');
    });

    it('sets #placementIds from payload', () => {
      const action = registerProductEnrichmentOptions({
        productId: 'product-123',
        placementIds: ['placement-1', 'placement-2'],
      });
      const finalState = productEnrichmentReducer(state, action);

      expect(finalState.placementIds).toEqual(['placement-1', 'placement-2']);
    });

    it('sets #placementIds to empty array when undefined in payload', () => {
      const action = registerProductEnrichmentOptions({
        productId: 'product-123',
      });
      const finalState = productEnrichmentReducer(state, action);

      expect(finalState.placementIds).toEqual([]);
    });

    it('overwrites existing values', () => {
      state.productId = 'old-product';
      state.placementIds = ['old-placement'];

      const action = registerProductEnrichmentOptions({
        productId: 'new-product',
        placementIds: ['new-placement'],
      });
      const finalState = productEnrichmentReducer(state, action);

      expect(finalState.productId).toBe('new-product');
      expect(finalState.placementIds).toEqual(['new-placement']);
    });
  });

  describe('on #fetchBadges.pending', () => {
    it('sets #isLoading to true', () => {
      const action = fetchBadges.pending('', {placementIds: []});
      const finalState = productEnrichmentReducer(state, action);

      expect(finalState.isLoading).toBe(true);
    });

    it('sets #error to null', () => {
      state.error = {
        message: 'message',
        statusCode: 500,
        type: 'type',
      };

      const action = fetchBadges.pending('', {placementIds: []});
      const finalState = productEnrichmentReducer(state, action);

      expect(finalState.error).toBeNull();
    });
  });

  describe('on #fetchBadges.fulfilled', () => {
    it('updates the state with the received payload', () => {
      const products = [
        buildMockBadgesProduct({
          productId: 'product-1',
          badgePlacements: [
            buildMockBadgePlacement({
              placementId: 'placement-1',
              badges: [
                buildMockBadge({
                  text: 'New',
                  iconUrl: 'https://example.com/icon.png',
                }),
              ],
            }),
          ],
        }),
        buildMockBadgesProduct({
          productId: 'product-2',
          badgePlacements: [
            buildMockBadgePlacement({
              placementId: 'placement-2',
              badges: [
                buildMockBadge({
                  text: 'Sale',
                  backgroundColor: '#FF0000',
                }),
              ],
            }),
          ],
        }),
      ];

      const action = fetchBadges.fulfilled(
        buildFetchBadgesResponse({products}),
        '',
        {placementIds: []}
      );
      const finalState = productEnrichmentReducer(state, action);

      expect(finalState.products).toEqual(products);
      expect(finalState.isLoading).toBe(false);
      expect(finalState.error).toBeNull();
    });

    it('sets #error to null', () => {
      state.error = {
        message: 'message',
        statusCode: 500,
        type: 'type',
      };

      const action = fetchBadges.fulfilled(
        buildFetchBadgesResponse({products: []}),
        '',
        {placementIds: []}
      );
      const finalState = productEnrichmentReducer(state, action);

      expect(finalState.error).toBeNull();
    });

    it('sets #isLoading to false', () => {
      state.isLoading = true;

      const action = fetchBadges.fulfilled(
        buildFetchBadgesResponse({products: []}),
        '',
        {placementIds: []}
      );
      const finalState = productEnrichmentReducer(state, action);

      expect(finalState.isLoading).toBe(false);
    });

    it('handles empty products array', () => {
      const action = fetchBadges.fulfilled(
        buildFetchBadgesResponse({products: []}),
        '',
        {placementIds: []}
      );
      const finalState = productEnrichmentReducer(state, action);

      expect(finalState.products).toEqual([]);
      expect(finalState.isLoading).toBe(false);
      expect(finalState.error).toBeNull();
    });

    it('handles multiple badge placements per product', () => {
      const products = [
        buildMockBadgesProduct({
          badgePlacements: [
            buildMockBadgePlacement({
              placementId: 'placement-1',
              badges: [buildMockBadge({text: 'New'})],
            }),
            buildMockBadgePlacement({
              placementId: 'placement-2',
              badges: [
                buildMockBadge({
                  text: 'Sale',
                  backgroundColor: '#FF0000',
                }),
              ],
            }),
          ],
        }),
      ];

      const action = fetchBadges.fulfilled(
        buildFetchBadgesResponse({products}),
        '',
        {placementIds: []}
      );
      const finalState = productEnrichmentReducer(state, action);

      expect(finalState.products[0].badgePlacements).toHaveLength(2);
    });

    it('handles multiple badges per placement', () => {
      const products = [
        buildMockBadgesProduct({
          badgePlacements: [
            buildMockBadgePlacement({
              badges: [
                buildMockBadge({text: 'New'}),
                buildMockBadge({
                  text: 'Featured',
                  backgroundColor: '#0000FF',
                }),
              ],
            }),
          ],
        }),
      ];

      const action = fetchBadges.fulfilled(
        buildFetchBadgesResponse({products}),
        '',
        {placementIds: []}
      );
      const finalState = productEnrichmentReducer(state, action);

      expect(finalState.products[0].badgePlacements[0].badges).toHaveLength(2);
    });
  });

  describe('on #fetchBadges.rejected', () => {
    const err = {
      message: 'Internal Server Error',
      statusCode: 500,
      type: 'error',
    };

    it('sets #error to the error payload', () => {
      const action = {type: fetchBadges.rejected.type, payload: err};
      const finalState = productEnrichmentReducer(state, action);

      expect(finalState.error).toEqual(err);
    });

    it('sets #isLoading to false', () => {
      state.isLoading = true;

      const action = {type: fetchBadges.rejected.type, payload: err};
      const finalState = productEnrichmentReducer(state, action);

      expect(finalState.isLoading).toBe(false);
    });

    it('clears #products array', () => {
      state.products = [buildMockBadgesProduct()];

      const action = {type: fetchBadges.rejected.type, payload: err};
      const finalState = productEnrichmentReducer(state, action);

      expect(finalState.products).toEqual([]);
    });

    it('handles undefined error payload', () => {
      const action = {type: fetchBadges.rejected.type, payload: undefined};
      const finalState = productEnrichmentReducer(state, action);

      expect(finalState.error).toBeNull();
      expect(finalState.isLoading).toBe(false);
      expect(finalState.products).toEqual([]);
    });
  });
});
