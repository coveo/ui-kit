'use client';

import {useCart, useProductList} from '@/lib/commerce-engine';
import {addToCart} from '@/utils/cart';
import {Product} from '@coveo/headless-react/ssr-commerce';
import Image from 'next/image';
import {useRouter} from 'next/navigation';

export default function ProductList() {
  const {state, methods} = useProductList();
  const {state: cartState, methods: cartMethods} = useCart();

  const router = useRouter();

  const onProductClick = (product: Product) => {
    methods?.interactiveProduct({options: {product}}).select();
    router.push(
      `/products/${product.ec_product_id}?name=${product.ec_name}&price=${product.ec_price}`
    );
  };

  return (
    <ul aria-label="Product List">
      {state.products.map((product) => (
        <li key={product.ec_product_id}>
          <button disabled={!methods} onClick={() => onProductClick(product)}>
            {product.ec_name}
            <Image
              src={product.ec_images[0]}
              alt={product.ec_name!}
              width={50}
              height={50}
            />
          </button>
          <button
            onClick={() =>
              addToCart(cartMethods!, cartState, product, state.responseId)
            }
          >
            Add to cart
          </button>
        </li>
      ))}
    </ul>
  );
}
