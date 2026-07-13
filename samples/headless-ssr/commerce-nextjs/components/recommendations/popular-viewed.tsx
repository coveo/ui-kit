'use client';

import {usePopularViewed} from '@/lib/commerce-engine';
import ProductButtonWithImage from '../product-button-with-image';

export default function PopularViewed() {
  const {state, methods} = usePopularViewed();

  if (state.products.length === 0) {
    return null;
  }

  return (
    <div>
      <h3>{state.headline}</h3>
      <ul>
        {state.products.map((product) => (
          <li key={product.ec_product_id}>
            <ProductButtonWithImage methods={methods} product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
}
