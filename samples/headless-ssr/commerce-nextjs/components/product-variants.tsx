'use client';

import type {
  ChildProduct,
  Product,
  ProductList,
  Recommendations,
} from '@coveo/headless-react/ssr-commerce';
import Image from 'next/image';

const MAX_VISIBLE_VARIANTS = 5;

interface ProductVariantsProps {
  methods:
    | Omit<Recommendations, 'state' | 'subscribe'>
    | Omit<ProductList, 'state' | 'subscribe'>
    | undefined;
  product: Product;
}

/**
 * Renders the other variants of a product ("Also available in:") as a row of
 * thumbnails. Selecting one promotes that variant to be the displayed product.
 * A trailing "and N more" indicates variants beyond the visible thumbnails.
 */
export default function ProductVariants({methods, product}: ProductVariantsProps) {
  const variants = product.children.filter((child) => child.permanentid !== product.permanentid);
  const totalVariants = product.totalNumberOfChildren ?? variants.length;

  // Only products that belong to a multi-variant group have something to show.
  if (totalVariants <= 1 || variants.length === 0) {
    return null;
  }

  const visibleVariants = variants.slice(0, MAX_VISIBLE_VARIANTS);
  const remaining = totalVariants - visibleVariants.length;

  const onSelectVariant = (child: ChildProduct): void => {
    methods?.promoteChildToParent(child);
  };

  return (
    <div className="ProductVariants">
      <span className="ProductVariantsLabel">Also available in:</span>
      <ul className="ProductVariantsList">
        {visibleVariants.map((child) => {
          const image = child.ec_images?.[0];
          return (
            <li key={child.permanentid}>
              <button
                type="button"
                className="ProductVariant"
                disabled={!methods}
                aria-label={`View variant: ${child.ec_name ?? child.permanentid}`}
                onClick={() => onSelectVariant(child)}
              >
                {image ? (
                  <Image
                    className="ProductVariantImage"
                    src={image}
                    alt={child.ec_name ?? ''}
                    width={56}
                    height={56}
                  />
                ) : (
                  <span
                    className="ProductVariantImage ProductImagePlaceholder"
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          );
        })}
        {remaining > 0 && <li className="ProductVariantsMore">and {remaining} more</li>}
      </ul>
    </div>
  );
}
