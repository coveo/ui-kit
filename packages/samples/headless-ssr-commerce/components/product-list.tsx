'use client';

import {useProductList} from '@/lib/commerce-engine';
import {Product} from '@coveo/headless-react/ssr-commerce';
import {useRouter} from 'next/navigation';

export default function ProductList() {
  const {state, controller} = useProductList();

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
        </li>
      ))}
    </ul>
  );
}
