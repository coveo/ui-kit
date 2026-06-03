import type {Product} from '@coveo/headless-react/ssr-commerce';
import {useNavigate} from 'react-router';
import {useProductList} from '@/lib/commerce-engine';

export default function ProductList() {
  const {state, methods} = useProductList();
  const navigate = useNavigate();

  const onProductClick = (product: Product) => {
    methods?.interactiveProduct({options: {product}}).select();
    navigate(
      `/products/${product.ec_product_id}?name=${product.ec_name}&price=${product.ec_price}`
    );
  };

  return (
    <ul aria-label="Product List">
      {state.products.map((product) => (
        <li key={product.ec_product_id}>
          <button
            type="button"
            disabled={!methods}
            onClick={() => onProductClick(product)}
          >
            {product.ec_name}
          </button>
        </li>
      ))}
    </ul>
  );
}
