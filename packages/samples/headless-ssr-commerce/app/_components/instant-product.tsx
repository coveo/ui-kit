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
    // // Normally here, you would simply navigate to product.clickUri.
    const productId = product.ec_product_id ?? product.permanentid;
    const productName = product.ec_name ?? product.permanentid;
    const productPrice = product.ec_promo_price ?? product.ec_price ?? NaN;
    const url = `/product/${productId}/${productName}/${productPrice}`;
    router.push(url, {scroll: false});
    // In this sample project, we navigate to a custom URL because the app doesn't have access to a commerce backend
    // service to retrieve detailed product information from for the purpose of rendering a product description page
    // (PDP).
    // Therefore, we encode bare-minimum product information in the URL, and use it to render the PDP.
    // This is by no means a realistic scenario.
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
