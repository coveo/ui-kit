import type {ProductListing as HeadlessProductListing} from '@coveo/headless/commerce';
import {type FunctionComponent, useEffect, useState} from 'react';

interface ProductListingProps {
  controller: HeadlessProductListing;
}

export const ProductListing: FunctionComponent<ProductListingProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  if (!state.products.length) {
    return <button onClick={() => controller.refresh()}>Refresh</button>;
  }

  return (
    <ul>
      {state.products.map(({ec_name, clickUri, permanentid}) => (
        <li key={permanentid}>
          <a href={clickUri}>{ec_name}</a>
        </li>
      ))}
    </ul>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildProductListing(engine);
 *
 * <ProductListing controller={controller} />;
 * ```
 */
