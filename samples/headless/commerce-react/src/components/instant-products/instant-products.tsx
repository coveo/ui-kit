import type {InstantProducts as HeadlessInstantProducts} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';
import {formatCurrency} from '../../utils/format-currency.js';
import {onClickProduct} from './actions/on-click-product.js';

interface IInstantProductProps {
  controller: HeadlessInstantProducts;
}

export default function InstantProducts(props: IInstantProductProps) {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState({...controller.state})), [controller]);

  if (state.products.length === 0 || !state.query) {
    return null;
  }

  return (
    <div className="InstantProducts">
      <p className="InstantProductsTitle">Instant products</p>
      <ul className="InstantProductList">
        {state.products.map((product) => {
          const price = product.ec_promo_price ?? product.ec_price;
          return (
            <li key={product.permanentid}>
              <button
                type="button"
                className="InstantProduct"
                onClick={() => onClickProduct(product, controller)}
              >
                <img
                  className="InstantProductImage"
                  src={product.ec_images?.[0] ?? ''}
                  alt={product.ec_name ?? product.permanentid}
                />
                <span className="InstantProductInfo">
                  <span className="InstantProductName">{product.ec_name}</span>
                  {price != null && (
                    <span className="InstantProductPrice">{formatCurrency(price)}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
