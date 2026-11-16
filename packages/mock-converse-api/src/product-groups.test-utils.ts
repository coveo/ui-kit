import {expect} from 'vitest';

type Product = Record<string, unknown>;

/** The properties of the schema's closed `Product`. */
export const PRODUCT_PROPERTIES = new Set([
  'permanentid',
  'ec_name',
  'ec_description',
  'ec_shortdesc',
  'ec_brand',
  'ec_category',
  'ec_price',
  'ec_promo_price',
  'ec_images',
  'ec_thumbnails',
  'ec_in_stock',
  'ec_rating',
  'ec_color',
  'ec_item_group_id',
  'ec_item_group_name',
  'clickUri',
  'additionalFields',
  'badgePlacements',
  'children',
  'totalNumberOfChildren',
]);

/**
 * Each product's name, how many children it lists and its `totalNumberOfChildren`, both absent for
 * a product without children.
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
 * then distinct `ProductChild`ren, each pictured by an image no other listed product shows.
 */
export function expectNormalizedGroups(products: Product[]) {
  const productImages = products.flatMap(({ec_images}) => ec_images as string[]);
  const childImages: string[] = [];
  for (const {children, totalNumberOfChildren, ...product} of products) {
    if (children === undefined) {
      expect(totalNumberOfChildren).toBeUndefined();
      continue;
    }
    const listed = children as Product[];
    const [first, ...others] = listed;
    expect(first).toEqual(product);
    for (const child of listed) {
      expect(Object.keys(child).filter((key) => !PRODUCT_PROPERTIES.has(key))).toEqual([]);
      expect(child).not.toHaveProperty('children');
      expect(child).not.toHaveProperty('totalNumberOfChildren');
    }
    expect(new Set(listed.map(({permanentid}) => permanentid)).size).toBe(listed.length);
    expect(totalNumberOfChildren).toBeGreaterThanOrEqual(listed.length);
    childImages.push(...others.flatMap(({ec_images}) => ec_images as string[]));
  }
  expect(new Set([...productImages, ...childImages]).size).toBe(
    new Set(productImages).size + childImages.length
  );
}
