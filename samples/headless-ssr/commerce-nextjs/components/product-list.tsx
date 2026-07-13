'use client';

import {useCart, useContext, useProductList} from '@/lib/commerce-engine';
import {addToCart} from '@/utils/cart';
import ProductButtonWithImage from './product-button-with-image';
import ProductPrice from './product-price';
import ProductVariants from './product-variants';

export default function ProductList() {
  const {state, methods} = useProductList();
  const {state: cartState, methods: cartMethods} = useCart();
  const {state: contextState} = useContext();

  return (
    <ul aria-label="Product List" className="ProductList">
      {state.products.map((item) => {
        const quantityInCart =
          cartState.items.find(
            (cartItem) => cartItem.productId === item.ec_product_id
          )?.quantity ?? 0;

        return (
          <li key={item.ec_product_id} className="ProductCard">
            <ProductButtonWithImage methods={methods} product={item} />
            <ProductPrice
              product={item}
              language={contextState.language}
              currency={contextState.currency}
            />
            {item.ec_description && (
              <p className="ProductDescription">{item.ec_description}</p>
            )}
            <ProductVariants methods={methods} product={item} />
            <button
              type="button"
              className="AddToCart"
              onClick={() => addToCart(cartMethods!, cartState, item, methods)}
            >
              Add to cart{quantityInCart > 0 ? ` (${quantityInCart})` : ''}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
