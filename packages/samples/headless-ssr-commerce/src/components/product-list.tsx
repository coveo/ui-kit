import {
  ProductList as ProductListingController,
  ProductListState,
} from '@coveo/headless/ssr-commerce';
import {useEffect, useState, FunctionComponent} from 'react';

interface ProductListProps {
  staticState: ProductListState;
  controller?: ProductListingController;
}

export const ProductList: FunctionComponent<ProductListProps> = ({
  staticState,
  controller,
}) => {
  const [state, setState] = useState(staticState);

  useEffect(
    () => controller?.subscribe(() => setState({...controller.state})),
    [controller]
  );

  return (
    <ul className="product-list">
      {state.products.map((product) => (
        <li key={product.ec_product_id}>
          <h3>{product.ec_name}</h3>
        </li>
      ))}
    </ul>
  );
};
