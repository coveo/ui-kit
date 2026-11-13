import {expect} from 'vitest';

type Product = Record<string, unknown>;

/**
 * Each product's name, how many children it lists and the size of its group, both absent for a
 * product without children.
 */
export function groupsOf(products: Product[]) {
  return products.map((product) => ({
    name: product.ec_name,
    listed: (product.children as Product[] | undefined)?.length,
    total: product.totalNumberOfChildren,
  }));
}

/**
 * Asserts that every grouped product lists its children as producers do: the product itself first,
 * children one level deep with distinct ids, and a group counting at least every listed child.
 */
export function expectNormalizedGroups(products: Product[]) {
  for (const {children, totalNumberOfChildren, ...product} of products) {
    if (children === undefined) {
      expect(totalNumberOfChildren).toBeUndefined();
      continue;
    }
    const listed = children as Product[];
    expect(listed[0]).toEqual(product);
    for (const child of listed) {
      expect(child).not.toHaveProperty('children');
      expect(child).not.toHaveProperty('totalNumberOfChildren');
    }
    expect(new Set(listed.map(({permanentid}) => permanentid)).size).toBe(listed.length);
    expect(totalNumberOfChildren).toBeGreaterThanOrEqual(listed.length);
  }
}
