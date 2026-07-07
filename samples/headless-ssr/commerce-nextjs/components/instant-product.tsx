import type {Product} from '@coveo/headless-react/ssr-commerce';
import {useCart, useInstantProducts} from '@/lib/commerce-engine';
import {addToCart} from '@/utils/cart';

export default function InstantProducts() {
  const {state, methods} = useInstantProducts();
  const {state: cartState, methods: cartMethods} = useCart();

  const clickProduct = (product: Product) => {
    methods?.interactiveProduct({options: {product}}).select();
    window.open(product.clickUri, '_blank', 'noopener,noreferrer');
  };

  return (
    <ul className="InstantProducts">
      {state.products.map((product) => (
        <li key={product.ec_product_id} className="InstantProduct">
          <button
            type="button"
            className="InstantProductLink"
            onClick={() => clickProduct(product)}
          >
            {product.ec_name}
          </button>
          <button
            type="button"
            className="LinkButton"
            onClick={() => addToCart(cartMethods!, cartState, product, methods)}
          >
            Add to cart
          </button>
        </li>
      ))}
    </ul>
  );
}
