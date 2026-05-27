import type {InstantProducts as HeadlessInstantProducts} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';
import {onClickProduct} from './actions/on-click-product.js';

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
                <button
                  onClick={() => onClickProduct(product, controller, navigate)}
                  type="button"
                >
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
