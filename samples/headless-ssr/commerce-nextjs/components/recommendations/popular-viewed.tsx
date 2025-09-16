'use client';

import {usePopularViewed} from '@/lib/commerce-engine';
import ProductButtonWithImage from '../product-button-with-image';

export default function PopularViewed() {
  const {state, methods} = usePopularViewed();

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
