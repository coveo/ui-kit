import {
  Search as SearchController,
  ProductListing as ProductListingController,
  ProductListingState,
  SearchState,
} from '@coveo/headless/ssr-commerce';
import {useEffect, useState, FunctionComponent} from 'react';
import ProductListCommon from '../common/product-list';

interface ProductListProps {
  staticState: ProductListingState | SearchState;
  controller?: ProductListingController | SearchController;
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

  return <ProductListCommon products={state.products} />;
};
