'use client';

import {ResultType} from '@coveo/headless-react/ssr-commerce';
import {useCart, useProductList} from '@/lib/commerce-engine';
import {addToCart} from '@/utils/cart';
import ProductButtonWithImage from './product-button-with-image';
import SpotlightContentButton from './spotlight-content-button';

export default function ProductList() {
  const {state, methods} = useProductList();
  const {state: cartState, methods: cartMethods} = useCart();

  // When enableResults is true, use results array; otherwise use products array
  const items = state.results.length > 0 ? state.results : state.products;

  return (
    <ul aria-label="Product List">
      {items.map((item) => {
        if (item?.resultType === ResultType.SPOTLIGHT) {
          return (
            <li key={item.id} className="spotlight-content">
              <SpotlightContentButton
                methods={methods}
                spotlightContent={item}
              />
            </li>
          );
        }

        return (
          <li key={item.ec_product_id}>
            <ProductButtonWithImage methods={methods} product={item} />

            <button
              type="button"
              onClick={() => addToCart(cartMethods!, cartState, item, methods)}
            >
              Add to cart
            </button>
          </li>
        );
      })}
    </ul>
  );
}
