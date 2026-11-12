import {useState} from 'react';
import type {Product, ProductVariant} from '@coveo/thermidor-schema';

/**
 * The product a slot shows, and how to promote one of its variants into it. A promoted variant
 * replaces the product's fields, such as its name, price, images and link, while the slot keeps the
 * product's variants and group size. The promotion is local to the slot: it sends nothing, and it
 * ends when the producer sends the product again.
 */
export function usePromotedProduct(
  product: Product
): [shown: Product, promote: (variant: ProductVariant) => void] {
  const [promotion, setPromotion] = useState<{of: Product; variant: ProductVariant}>();
  const promote = (variant: ProductVariant) => setPromotion({of: product, variant});
  if (promotion?.of !== product) {
    return [product, promote];
  }
  const {children, totalNumberOfChildren} = product;
  return [{...promotion.variant, children, totalNumberOfChildren}, promote];
}
