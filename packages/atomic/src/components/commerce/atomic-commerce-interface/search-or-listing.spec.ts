import {buildProductListing, buildSearch} from '@coveo/headless/commerce';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {buildSearchOrListing, shouldEnableResults} from './search-or-listing';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('search-or-listing', () => {
  const engine = buildFakeCommerceEngine();

  describe('#shouldEnableResults', () => {
    it('should return false when the interface element is undefined', () => {
      expect(shouldEnableResults(undefined)).toBe(false);
    });

    it('should return false when enableSpotlightContent is not set', () => {
      expect(shouldEnableResults({type: 'search'})).toBe(false);
    });

    it('should return true when enableSpotlightContent is true', () => {
      expect(shouldEnableResults({enableSpotlightContent: true})).toBe(true);
    });
  });

  describe('#buildSearchOrListing', () => {
    beforeEach(() => {
      vi.mocked(buildSearch).mockReturnValue(buildFakeSearch({}));
      vi.mocked(buildProductListing).mockReturnValue(buildFakeProductListing({}));
    });

    it('should build a product listing controller when type is "product-listing"', () => {
      const controller = buildSearchOrListing(engine, {type: 'product-listing'});

      expect(buildProductListing).toHaveBeenCalledWith(engine, {enableResults: false});
      expect(controller).toBe(vi.mocked(buildProductListing).mock.results[0].value);
    });

    it('should build a search controller when type is "search"', () => {
      const controller = buildSearchOrListing(engine, {type: 'search'});

      expect(buildSearch).toHaveBeenCalledWith(engine, {enableResults: false});
      expect(controller).toBe(vi.mocked(buildSearch).mock.results[0].value);
    });

    it('should enable results when enableSpotlightContent is true', () => {
      buildSearchOrListing(engine, {
        type: 'product-listing',
        enableSpotlightContent: true,
      });

      expect(buildProductListing).toHaveBeenCalledWith(engine, {enableResults: true});
    });
  });
});
