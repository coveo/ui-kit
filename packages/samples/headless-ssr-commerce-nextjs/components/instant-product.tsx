import {useCart, useInstantProducts} from '@/lib/commerce-engine';
import {addToCart} from '@/utils/cart';
import {Product} from '@coveo/headless-react/ssr-commerce';
import {useRouter} from 'next/navigation';

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
      {state.products.map((product, index) => (
        <li key={index}>
          <button onClick={() => clickProduct(product)}>
            {product.ec_name} ({product.ec_product_id})
          </button>
          <button
            onClick={() => addToCart(cartMethods!, cartState, product, methods)}
          >
            Add to cart
          </button>
        </li>
      ))}
    </ul>
  );
}
