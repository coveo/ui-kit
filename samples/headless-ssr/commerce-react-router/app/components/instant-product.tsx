import type {Product} from '@coveo/headless-react/ssr-commerce';
import {useNavigate} from 'react-router';
import {useInstantProducts} from '@/lib/commerce-engine';
import AddToCartButton from './add-to-cart-button.js';

export default function InstantProducts() {
  const navigate = useNavigate();

  const {state, methods} = useInstantProducts();

  const clickProduct = (product: Product) => {
    methods?.interactiveProduct({options: {product}}).select();
    navigate(
      `/products/${product.ec_product_id}?name=${product.ec_name}&price=${product.ec_price}`
    );
  };

  return (
    <ul>
      Instant Products :
      {state.products.map((product) => (
        <li key={product.ec_product_id}>
          <button type="button" onClick={() => clickProduct(product)}>
            {product.ec_name} ({product.ec_product_id})
          </button>
          {product.ec_product_id &&
            product.ec_price !== null &&
            product.ec_name && (
              <AddToCartButton
                productId={product.ec_product_id}
                price={product.ec_price}
                name={product.ec_name}
              />
            )}
        </li>
      ))}
    </ul>
  );
}
