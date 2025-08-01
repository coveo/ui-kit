'use client';

import {useViewedTogether} from '@/lib/commerce-engine';
import ProductButtonWithImage from '../product-button-with-image';

export default function ViewedTogether() {
  const {state, methods} = useViewedTogether();

  return (
    <ul>
      <h3>{state.headline}</h3>
      {state.products.map((product) => (
        <li key={product.ec_product_id}>
          <ProductButtonWithImage methods={methods} product={product} />
        </li>
      ))}
      <button type="button" onClick={() => methods?.refresh()}>
        Refresh
      </button>
    </ul>
  );
}
