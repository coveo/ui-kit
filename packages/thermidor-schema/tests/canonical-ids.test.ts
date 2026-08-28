import {describe, expect, it} from 'vitest';
import {
  ProductListControllerContractSchema,
  CartControllerContractSchema,
  ControllerContractsSchema,
} from '../src/index.js';

describe('canonical schema IDs', () => {
  it('ProductListControllerContract exposes the exact canonical ID literal', () => {
    expect(ProductListControllerContractSchema.shape.controllerSchema.value).toBe(
      'https://schema.thermidor.coveo.com/controllers/product-list.schema.json'
    );
  });

  it('CartControllerContract exposes the exact canonical ID literal', () => {
    expect(CartControllerContractSchema.shape.controllerSchema.value).toBe(
      'https://schema.thermidor.coveo.com/controllers/cart.schema.json'
    );
  });

  it('ControllerContracts discriminated union uses controllerSchema as discriminator', () => {
    const productOption = ControllerContractsSchema.options.find(
      (option: any) =>
        option.shape.controllerSchema.value ===
        'https://schema.thermidor.coveo.com/controllers/product-list.schema.json'
    );
    expect(productOption).toBe(ProductListControllerContractSchema);

    const cartOption = ControllerContractsSchema.options.find(
      (option: any) =>
        option.shape.controllerSchema.value ===
        'https://schema.thermidor.coveo.com/controllers/cart.schema.json'
    );
    expect(cartOption).toBe(CartControllerContractSchema);
  });

  it('rejects a value with unknown controllerSchema', () => {
    const unknownContract = {
      actions: {},
      controllerSchema: 'https://schema.thermidor.coveo.com/controllers/unknown.schema.json',
      state: {products: []},
    };
    expect(ControllerContractsSchema.safeParse(unknownContract).success).toBe(false);
  });
});
