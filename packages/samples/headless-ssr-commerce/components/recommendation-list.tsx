'use client';

import {usePopularBoughtRecs} from '@/lib/commerce-engine';
import {Product} from '@coveo/headless-react/ssr-commerce';
import {useRouter} from 'next/navigation';
import {FunctionComponent} from 'react';

export const Recommendations: FunctionComponent = () => {
  // TODO: KIT-3503: refresh recs server side
  const {state, controller} = usePopularBoughtRecs();

  const router = useRouter();

  const onProductClick = (product: Product) => {
    controller?.interactiveProduct({options: {product}}).select();
    router.push(
      `/products/${product.ec_product_id}?name=${product.ec_name}&price=${product.ec_price}`
    );
  };

  return (
    <>
      <ul>
        <h3>{state.headline}</h3>
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
    </>
  );
};
