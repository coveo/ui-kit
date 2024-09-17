import {
  InstantProductsState,
  InstantProducts as InstantProductsController,
  Product,
} from '@coveo/headless/ssr-commerce';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';

interface InstantProductsProps {
  staticState: InstantProductsState;
  controller?: InstantProductsController;
}

export default function InstantProducts({
  staticState,
  controller,
}: InstantProductsProps) {
  const router = useRouter();

  const [state, setState] = useState(staticState);

  useEffect(
    () =>
      controller?.subscribe(() => {
        setState({...controller.state});
      }),
    [controller]
  );

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
        </li>
      ))}
    </ul>
  );
}
