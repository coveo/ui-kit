import type {Product} from '@coveo/headless-react/ssr-commerce';
import Image from 'next/image';
import {useContext, useInstantProducts} from '@/lib/commerce-engine';
import {formatCurrency} from '@/utils/format-currency';

/**
 * Compact preview of the products that best match the current query, shown in
 * the search box dropdown. Clicking a product logs a product-click event and
 * opens its page (via `clickUri`).
 */
export default function InstantProducts() {
  const {state, methods} = useInstantProducts();
  const {state: contextState} = useContext();

  const clickProduct = (product: Product) => {
    methods?.interactiveProduct({options: {product}}).select();
    window.open(product.clickUri, '_blank', 'noopener,noreferrer');
  };

  return (
    <ul className="InstantProducts">
      {state.products.map((product) => {
        const image = product.ec_images?.[0];
        return (
          <li key={product.ec_product_id} className="InstantProduct">
            <button
              type="button"
              className="InstantProductLink"
              onClick={() => clickProduct(product)}
            >
              {image ? (
                <Image
                  className="InstantProductImage"
                  src={image}
                  alt={product.ec_name ?? ''}
                  width={48}
                  height={48}
                />
              ) : (
                <span
                  className="InstantProductImage InstantProductImagePlaceholder"
                  aria-hidden="true"
                />
              )}
              <span className="InstantProductInfo">
                <span className="InstantProductName">{product.ec_name}</span>
                {product.ec_price != null && (
                  <span className="InstantProductPrice">
                    {formatCurrency(
                      product.ec_price,
                      contextState.language,
                      contextState.currency
                    )}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
