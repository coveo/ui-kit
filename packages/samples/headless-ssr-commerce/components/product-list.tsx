'use client';

import {useCart, useProductList} from '@/lib/commerce-engine';
import {addToCart} from '@/utils/cart';
import {Product} from '@coveo/headless-react/ssr-commerce';
import Image from 'next/image';

export default function ProductList() {
  const {state, methods} = useProductList();
  const {methods: cartMethods} = useCart();

  const onProductClick = (product: Product) => {
    methods?.interactiveProduct({options: {product}}).select();
  };
  return (
    <ul>
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
          <button onClick={() => addToCart(cartMethods!, product)}>
            Add to cart
          </button>
          <button onClick={() => addToCart(cartMethods!, product)}>
            Add to cart
          </button>
        </li>
      ))}
    </ul>
  );
}
