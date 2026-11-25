import {useState} from 'react';
import type {Product, ProductChild} from '@coveo/thermidor-schema';

/**
 * The product a slot shows, and how to promote one of its children into it. A promoted child
 * replaces the product's fields, such as its name, price, images and link, while the slot keeps the
 * product's children and their count. The promotion is local to the slot: it sends nothing, and it
 * ends once a write changes the product. The renderer keeps a product written again unchanged as
 * the same object, so such a write keeps the promotion.
 */
export function usePromotedProduct(
  product: Product
): [shown: Product, promote: (child: ProductChild) => void] {
  const [promotion, setPromotion] = useState<{of: Product; child: ProductChild}>();
  const promote = (child: ProductChild) => setPromotion({of: product, child});
  if (promotion?.of !== product) {
    return [product, promote];
  }
  const {children, totalNumberOfChildren} = product;
  return [{...promotion.child, children, totalNumberOfChildren}, promote];
}
