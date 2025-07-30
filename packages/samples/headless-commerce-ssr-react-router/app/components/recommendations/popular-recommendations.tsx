import type {Product} from '@coveo/headless-react/ssr-commerce';
import {useNavigate} from 'react-router';
import {
  usePopularBoughtRecs,
  usePopularViewedRecs,
} from '@/lib/commerce-engine';

type RecommendationType = 'bought' | 'viewed';

interface PopularRecommendationsProps {
  type: RecommendationType;
}

export default function PopularRecommendations({
  type,
}: PopularRecommendationsProps) {
  const boughtRecs = usePopularBoughtRecs();
  const viewedRecs = usePopularViewedRecs();
  const {state, methods} = type === 'bought' ? boughtRecs : viewedRecs;
  const navigate = useNavigate();

  const onProductClick = (product: Product) => {
    methods?.interactiveProduct({options: {product}}).select();
    navigate(
      `/products/${product.ec_product_id}?name=${product.ec_name}&price=${product.ec_price}`
    );
  };

  return (
    <ul>
      <h3>{state.headline}</h3>
      {state.products.map((product: Product) => (
        <li key={product.ec_product_id}>
          <button
            type="button"
            disabled={!methods}
            onClick={() => onProductClick(product)}
          >
            {product.ec_name}
            <img
              src={product.ec_images[0]}
              alt={product.ec_name!}
              width={50}
              height={50}
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
