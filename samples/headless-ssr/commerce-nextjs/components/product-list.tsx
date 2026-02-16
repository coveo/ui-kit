'use client';

import {useCart, useProductList} from '@/lib/commerce-engine';
import {addToCart} from '@/utils/cart';
import ProductButtonWithImage from './product-button-with-image';

export default function ProductList() {
  const {state, methods} = useProductList();
  const {state: cartState, methods: cartMethods} = useCart();

  return (
    <ul aria-label="Product List">
      {state.products.map((product) => (
        <li key={product.ec_product_id}>
          <ProductButtonWithImage methods={methods} product={product} />

          <button
            type="button"
            onClick={() => addToCart(cartMethods!, cartState, product, methods)}
          >
            Add to cart
          </button>
        </li>
      ))}
    </ul>
  );
}
