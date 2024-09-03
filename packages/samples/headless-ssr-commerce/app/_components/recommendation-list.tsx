import {
  Product,
  Recommendations as RecommendationsController,
  RecommendationsState,
} from '@coveo/headless/ssr-commerce';
import {useRouter} from 'next/navigation';
import {useEffect, useState, FunctionComponent} from 'react';

interface RecommendationsProps {
  staticState: RecommendationsState;
  controller?: RecommendationsController;
}

export const Recommendations: FunctionComponent<RecommendationsProps> = ({
  staticState,
  controller,
}) => {
  const [state, setState] = useState(staticState);

  const router = useRouter();

  useEffect(
    () => controller?.subscribe(() => setState({...controller.state})),
    [controller]
  );

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
