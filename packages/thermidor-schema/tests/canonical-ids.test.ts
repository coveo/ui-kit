import {describe, expect, it} from 'vitest';
import {ProductCarouselSchema, ComponentContractsSchema} from '../src/index.js';

describe('canonical schema IDs', () => {
  it('ProductCarousel exposes the exact componentType literal', () => {
    expect(ProductCarouselSchema.shape.componentType.value).toBe('product-carousel');
  });

  it('ComponentContracts discriminated union uses componentType as discriminator', () => {
    const productOption = ComponentContractsSchema.options.find(
      (option: any) => option.shape.componentType.value === 'product-carousel'
    );
    expect(productOption).toBe(ProductCarouselSchema);
  });

  it('rejects a value with unknown componentType', () => {
    const unknownContract = {
      actions: {},
      componentType: 'unknown-component',
      state: {products: []},
    };
    expect(ComponentContractsSchema.safeParse(unknownContract).success).toBe(false);
  });
});
