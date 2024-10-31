'use client';

import {Product} from '@coveo/headless-react/ssr-commerce';
import {useRouter} from 'next/navigation';
import {FunctionComponent} from 'react';
import {usePopularBoughtRecs} from '../_lib/commerce-engine';

export const Recommendations: FunctionComponent = () => {
  // TODO: find a way to make the recommendation generic
  const {state, controller} = usePopularBoughtRecs();
  // TODO: recommendation are not refreshed server-side FIXME:

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
