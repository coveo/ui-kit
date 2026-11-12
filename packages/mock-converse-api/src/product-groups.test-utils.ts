import {expect} from 'vitest';

type Product = Record<string, unknown>;

/**
 * Each product's name, how many variants it lists and the size of its group, both absent for a
 * product without variants.
 */
export function groupsOf(products: Product[]) {
  return products.map((product) => ({
    name: product.ec_name,
    listed: (product.children as Product[] | undefined)?.length,
    total: product.totalNumberOfChildren,
  }));
}

/**
 * Asserts that every grouped product lists its variants as producers do: the product itself first,
 * variants one level deep with distinct ids, and a group counting at least every listed variant.
 */
export function expectNormalizedGroups(products: Product[]) {
  for (const {children, totalNumberOfChildren, ...product} of products) {
    if (children === undefined) {
      expect(totalNumberOfChildren).toBeUndefined();
      continue;
    }
    const variants = children as Product[];
    expect(variants[0]).toEqual(product);
    for (const variant of variants) {
      expect(variant).not.toHaveProperty('children');
      expect(variant).not.toHaveProperty('totalNumberOfChildren');
    }
    expect(new Set(variants.map(({permanentid}) => permanentid)).size).toBe(variants.length);
    expect(totalNumberOfChildren).toBeGreaterThanOrEqual(variants.length);
  }
}
