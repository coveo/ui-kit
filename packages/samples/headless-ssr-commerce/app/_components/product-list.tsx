'use client';

import {Product} from '@coveo/headless-react/ssr-commerce';
import {useRouter} from 'next/navigation';
import {useProductList} from '../_lib/commerce-engine';

export default function ProductList() {
  const {state, methods} = useProductList();

  const router = useRouter();

  const onProductClick = (product: Product) => {
    methods?.interactiveProduct({options: {product}}).select();
    router.push(
      `/products/${product.ec_product_id}?name=${product.ec_name}&price=${product.ec_price}`
    );
  };

  return (
    <ul>
      {state.products.map((product) => (
        <li key={product.ec_product_id}>
          <button disabled={!methods} onClick={() => onProductClick(product)}>
            {product.ec_name}
          </button>
        </li>
      ))}
    </ul>
  );
}
