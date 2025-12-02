import {type CommerceEngine, Selectors} from '@coveo/headless/commerce';
import {describe, expect, it, vi} from 'vitest';
import {createCommerceStore} from './store';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('CommerceStore', () => {
  it('should set and unset loading flags correctly', () => {
    const store = createCommerceStore('search');
    const loadingFlag = 'test-loading-flag';

    expect(store.state.loadingFlags).not.toContain(loadingFlag);

    store.setLoadingFlag(loadingFlag);
    expect(store.state.loadingFlags).toContain(loadingFlag);

    store.unsetLoadingFlag(loadingFlag);
    expect(store.state.loadingFlags).not.toContain(loadingFlag);
  });

  it('should correctly identify mobile state', () => {
    const store = createCommerceStore('search');
    const originalMatchMedia = window.matchMedia;

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    expect(store.isMobile()).toBe(true);

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    expect(store.isMobile()).toBe(false);

    window.matchMedia = originalMatchMedia;
  });

  it('should return unique ID from engine based on type', () => {
    const mockEngine = {
      state: {},
    } as unknown as CommerceEngine;

    const searchStore = createCommerceStore('search');
    const productListingStore = createCommerceStore('product-listing');

    vi.spyOn(Selectors.Search, 'responseIdSelector').mockReturnValue(
      'search-id'
    );
    vi.spyOn(Selectors.ProductListing, 'responseIdSelector').mockReturnValue(
      'product-listing-id'
    );

    expect(searchStore.getUniqueIDFromEngine(mockEngine)).toBe('search-id');
    expect(productListingStore.getUniqueIDFromEngine(mockEngine)).toBe(
      'product-listing-id'
    );
  });
});
