import {
  ProductListing as ProductListingController,
  ProductListingState,
  Cart as CartController,
} from '@coveo/headless/ssr-commerce';
import {useEffect, useState, FunctionComponent} from 'react';

interface ProductListProps {
  staticState: ProductListingState;
  controller?: ProductListingController;
  cartController?: CartController;
}

export const ProductList: FunctionComponent<ProductListProps> = ({
  staticState,
  controller,
}) => {
  const [state, setState] = useState(staticState);

  // useEffect(
  //   () => controller?.subscribe(() => setState({...controller.state})),
  //   [controller]
  // );

  useEffect(() => {
    controller?.subscribe(() => {
      const newState = {...controller.state};
      setState(newState);
      console.log('Updated state:', newState);
    });

    // Cleanup function to unsubscribe when the component unmounts
  }, [controller]);

  return (
    <ul>
      {state.products.map((product) => (
        <li key={product.ec_product_id}>
          <h3>{product.ec_name}</h3>
        </li>
      ))}
    </ul>
  );
};
