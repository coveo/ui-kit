import {useEffect, useState, FunctionComponent} from 'react';
import {ProductListing as HeadlessProductListing} from '@coveo/headless/product-listing';

interface ProductListingProps {
  controller: HeadlessProductListing;
}

export const ProductListing: FunctionComponent<ProductListingProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

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
