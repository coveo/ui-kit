'use client';

import {ResultType} from '@coveo/headless-react/ssr-commerce';
import {useCart, useContext, useProductList} from '@/lib/commerce-engine';
import {addToCart} from '@/utils/cart';
import {formatCurrency} from '@/utils/format-currency';
import ProductButtonWithImage from './product-button-with-image';
import SpotlightContentButton from './spotlight-content-button';

export default function ProductList() {
  const {state, methods} = useProductList();
  const {state: cartState, methods: cartMethods} = useCart();
  const {state: contextState} = useContext();

  const items = state.results.length > 0 ? state.results : state.products;

  return (
    <ul aria-label="Product List" className="ProductList">
      {items.map((item) => {
        if (item?.resultType === ResultType.SPOTLIGHT) {
          return (
            <li key={item.id} className="ProductCard SpotlightContent">
              <SpotlightContentButton
                methods={methods}
                spotlightContent={item}
              />
            </li>
          );
        }

        const quantityInCart =
          cartState.items.find(
            (cartItem) => cartItem.productId === item.ec_product_id
          )?.quantity ?? 0;

        return (
          <li key={item.ec_product_id} className="ProductCard">
            <ProductButtonWithImage methods={methods} product={item} />
            {item.ec_price != null && (
              <span className="ProductPrice">
                {formatCurrency(
                  item.ec_price,
                  contextState.language,
                  contextState.currency
                )}
              </span>
            )}
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
