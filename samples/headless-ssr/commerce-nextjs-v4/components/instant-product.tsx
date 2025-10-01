import type {Product} from '@coveo/headless-react/ssr-commerce-next';
import {useRouter} from 'next/navigation';
import {useCart, useInstantProducts} from '@/lib/commerce-engine';
import {addToCart} from '@/utils/cart';

export default function InstantProducts() {
  const router = useRouter();

  const {state, methods} = useInstantProducts();
  const {state: cartState, methods: cartMethods} = useCart();

  const clickProduct = (product: Product) => {
    methods?.interactiveProduct({options: {product}}).select();
    router.push(
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
          <button
            type="button"
            onClick={() => addToCart(cartMethods!, cartState, product, methods)}
          >
            Add to cart
          </button>
        </li>
      ))}
    </ul>
  );
}
