'use client';

import {useCart, useProductList} from '@/lib/commerce-engine';
import {addToCart} from '@/utils/cart';
import {Product} from '@coveo/headless-react/ssr-commerce';
import {useRouter} from 'next/navigation';

export default function ProductList() {
  const {state, controller} = useProductList();
  const {controller: cartController} = useCart();

  const router = useRouter();

  const onProductClick = (product: Product) => {
    controller?.interactiveProduct({options: {product}}).select();
    router.push(
      `/products/${product.ec_product_id}?name=${product.ec_name}&price=${product.ec_price}`
    );
  };

  return (
    <ul>
      {state.products.map((product) => (
        <li key={product.ec_product_id}>
          <button
            disabled={!controller}
            onClick={() => onProductClick(product)}
          >
            {product.ec_name}
          </button>
          <button onClick={() => addToCart(cartController!, product)}>
            Add to cart
          </button>
        </li>
      ))}
    </ul>
  );
}
