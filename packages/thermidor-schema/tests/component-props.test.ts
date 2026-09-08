import {describe, expect, it} from 'vitest';
import {
  ProductCarouselPropsSchema,
  NextActionsBarPropsSchema,
  BundleDisplayPropsSchema,
  ComparisonTablePropsSchema,
  CartPropsSchema,
  ProductCarouselSchema,
  NextActionsBarSchema,
  BundleDisplaySchema,
  ComparisonTableSchema,
  CartSchema,
} from '../src/index.js';

describe('component props schemas', () => {
  describe('schema literal alignment', () => {
    it('ProductCarouselPropsSchema componentType matches ProductCarousel contract', () => {
      expect(ProductCarouselPropsSchema.shape.componentType.value).toBe(
        ProductCarouselSchema.shape.componentType.value
      );
    });

    it('NextActionsBarPropsSchema componentType matches NextActionsBar contract', () => {
      expect(NextActionsBarPropsSchema.shape.componentType.value).toBe(
        NextActionsBarSchema.shape.componentType.value
      );
    });

    it('BundleDisplayPropsSchema componentType matches BundleDisplay contract', () => {
      expect(BundleDisplayPropsSchema.shape.componentType.value).toBe(
        BundleDisplaySchema.shape.componentType.value
      );
    });

    it('ComparisonTablePropsSchema componentType matches ComparisonTable contract', () => {
      expect(ComparisonTablePropsSchema.shape.componentType.value).toBe(
        ComparisonTableSchema.shape.componentType.value
      );
    });

    it('CartPropsSchema componentType matches Cart contract', () => {
      expect(CartPropsSchema.shape.componentType.value).toBe(CartSchema.shape.componentType.value);
    });
  });

  describe('validation', () => {
    it('accepts valid ProductCarousel props', () => {
      expect(
        ProductCarouselPropsSchema.safeParse({
          componentId: 'featured-products',
          componentType: 'product-carousel',
        }).success
      ).toBe(true);
    });

    it('rejects ProductCarousel props with wrong componentType literal', () => {
      expect(
        ProductCarouselPropsSchema.safeParse({
          componentId: 'featured-products',
          componentType: 'cart',
        }).success
      ).toBe(false);
    });

    it('rejects ProductCarousel props with missing componentId', () => {
      expect(
        ProductCarouselPropsSchema.safeParse({
          componentType: 'product-carousel',
        }).success
      ).toBe(false);
    });

    it('accepts valid NextActionsBar props', () => {
      expect(
        NextActionsBarPropsSchema.safeParse({
          componentId: 'suggested-actions',
          componentType: 'next-actions-bar',
        }).success
      ).toBe(true);
    });

    it('accepts valid Cart props', () => {
      expect(
        CartPropsSchema.safeParse({
          componentId: 'shopping-cart',
          componentType: 'cart',
        }).success
      ).toBe(true);
    });
  });
});
