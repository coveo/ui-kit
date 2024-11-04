import {useCart, useInstantProducts} from '@/lib/commerce-engine';
import {addToCart} from '@/utils/cart';
import {Product} from '@coveo/headless-react/ssr-commerce';
import {useRouter} from 'next/navigation';

export default function InstantProducts() {
  const router = useRouter();

  const {state, controller} = useInstantProducts();
  const {controller: cartController} = useCart();

  const clickProduct = (product: Product) => {
    controller?.interactiveProduct({options: {product}}).select();
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
          <button onClick={() => addToCart(cartController!, product)}>
            Add to cart
          </button>
        </li>
      ))}
    </ul>
  );
}
