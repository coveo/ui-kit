'use client';

import {usePopularBought} from '@/lib/commerce-engine';
import ProductButtonWithImage from '../product-button-with-image';

export default function PopularBought() {
  const {state, methods} = usePopularBought();

  return (
    <ul>
      <h3>{state.headline}</h3>
      {state.products.map((product) => (
        <li key={product.ec_product_id}>
          <ProductButtonWithImage methods={methods} product={product} />
        </li>
      ))}
    </ul>
  );
}
