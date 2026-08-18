import {describe, expect, it} from 'vitest';
import {
  ProductCarouselPropsSchema,
  NextActionsBarPropsSchema,
  BundleDisplayPropsSchema,
  ComparisonTablePropsSchema,
  CartPropsSchema,
  ProductListControllerContractSchema,
  NextActionsControllerContractSchema,
  BundleDisplayControllerContractSchema,
  ComparisonTableControllerContractSchema,
  CartControllerContractSchema,
} from '../src/index.js';

describe('component props schemas', () => {
  describe('schema literal alignment', () => {
    it('ProductCarouselPropsSchema controllerSchema matches ProductListControllerContract', () => {
      expect(
        ProductCarouselPropsSchema.shape.controllers.shape.productListController.shape
          .controllerSchema.value
      ).toBe(ProductListControllerContractSchema.shape.controllerSchema.value);
    });

    it('NextActionsBarPropsSchema controllerSchema matches NextActionsControllerContract', () => {
      expect(
        NextActionsBarPropsSchema.shape.controllers.shape.nextActionsController.shape
          .controllerSchema.value
      ).toBe(NextActionsControllerContractSchema.shape.controllerSchema.value);
    });

    it('BundleDisplayPropsSchema controllerSchema matches BundleDisplayControllerContract', () => {
      expect(
        BundleDisplayPropsSchema.shape.controllers.shape.bundleDisplayController.shape
          .controllerSchema.value
      ).toBe(BundleDisplayControllerContractSchema.shape.controllerSchema.value);
    });

    it('ComparisonTablePropsSchema controllerSchema matches ComparisonTableControllerContract', () => {
      expect(
        ComparisonTablePropsSchema.shape.controllers.shape.comparisonTableController.shape
          .controllerSchema.value
      ).toBe(ComparisonTableControllerContractSchema.shape.controllerSchema.value);
    });

    it('CartPropsSchema controllerSchema matches CartControllerContract', () => {
      expect(
        CartPropsSchema.shape.controllers.shape.cartController.shape.controllerSchema.value
      ).toBe(CartControllerContractSchema.shape.controllerSchema.value);
    });
  });

  describe('validation', () => {
    it('accepts valid ProductCarousel props', () => {
      expect(
        ProductCarouselPropsSchema.safeParse({
          controllers: {
            productListController: {
              controllerId: 'featured-products',
              controllerSchema:
                'https://schema.thermidor.coveo.com/controllers/product-list.schema.json',
            },
          },
        }).success
      ).toBe(true);
    });

    it('rejects ProductCarousel props with wrong controllerSchema literal', () => {
      expect(
        ProductCarouselPropsSchema.safeParse({
          controllers: {
            productListController: {
              controllerId: 'featured-products',
              controllerSchema: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
            },
          },
        }).success
      ).toBe(false);
    });

    it('rejects ProductCarousel props with missing controllerId', () => {
      expect(
        ProductCarouselPropsSchema.safeParse({
          controllers: {
            productListController: {
              controllerSchema:
                'https://schema.thermidor.coveo.com/controllers/product-list.schema.json',
            },
          },
        }).success
      ).toBe(false);
    });

    it('accepts valid NextActionsBar props', () => {
      expect(
        NextActionsBarPropsSchema.safeParse({
          controllers: {
            nextActionsController: {
              controllerId: 'suggested-actions',
              controllerSchema:
                'https://schema.thermidor.coveo.com/controllers/next-actions.schema.json',
            },
          },
        }).success
      ).toBe(true);
    });

    it('accepts valid Cart props', () => {
      expect(
        CartPropsSchema.safeParse({
          controllers: {
            cartController: {
              controllerId: 'shopping-cart',
              controllerSchema: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
            },
          },
        }).success
      ).toBe(true);
    });
  });
});
