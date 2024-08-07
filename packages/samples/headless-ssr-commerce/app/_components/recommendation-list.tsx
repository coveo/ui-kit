import {
  Recommendations as RecommendationsController,
  RecommendationsState,
} from '@coveo/headless/ssr-commerce';
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

  useEffect(
    () => controller?.subscribe(() => setState({...controller.state})),
    [controller]
  );

  return (
    <>
      <button
        onClick={() => {
          controller?.refresh();
        }}
      >
        {' '}
        Refresh{' '}
      </button>
      <ul className="product-list">
        {state.products.map((product) => (
          <li key={product.ec_product_id}>
            <h3>{product.ec_name}</h3>
          </li>
        ))}
      </ul>
    </>
  );
};
