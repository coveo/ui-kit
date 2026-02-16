import type {
  InstantProducts as HeadlessInstantProducts,
  Product,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface IInstantProductProps {
  controller: HeadlessInstantProducts;
  navigate: (pathName: string) => void;
}

export default function InstantProducts(props: IInstantProductProps) {
  const {controller, navigate} = props;
  const [state, setState] = useState(controller.state);

  useEffect(
    () => controller.subscribe(() => setState({...controller.state})),
    [controller]
  );

  if (state.products.length === 0 || !state.query) {
    return null;
  }

  const onClickProduct = (product: Product) => {
    controller.interactiveProduct({options: {product}}).select();

    // Normally here, you would simply navigate to product.clickUri.
    const productId = product.ec_product_id ?? product.permanentid;
    const productName = product.ec_name ?? product.permanentid;
    const productPrice = product.ec_promo_price ?? product.ec_price ?? NaN;
    navigate(`/product/${productId}/${productName}/${productPrice}`);
    // In this sample project, we navigate to a custom URL because the app doesn't have access to a commerce backend
    // service to retrieve detailed product information from for the purpose of rendering a product description page
    // (PDP).
    // Therefore, we encode bare-minimum product information in the URL, and use it to render the PDP.
    // This is by no means a realistic scenario.
  };

  return (
    <div className="InstantProducts">
      {state.products.length === 0 ? (
        <p className="NoInstantProducts">
          No instant products for query <b>{state.query}</b>
        </p>
      ) : (
        <>
          <p>
            Instant products for query <b>{state.query}</b>
          </p>
          <ul className="InstantProducts">
            {state.products.map((product) => (
              <li className="Product" key={product.permanentid}>
                <button onClick={() => onClickProduct(product)} type="button">
                  {product.ec_name} ({product.ec_product_id})
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
