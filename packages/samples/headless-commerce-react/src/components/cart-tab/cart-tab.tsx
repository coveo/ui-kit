import type {Cart} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface ICartTab {
  controller: Cart;
  onChange: () => void;
}

export default function CartTab(props: ICartTab) {
  const {controller, onChange} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => setState(controller.state));
  }, [controller]);

  return (
    <span>
      <input
        aria-label={`Cart (${state.totalQuantity})`}
        checked={window.location.pathname === '/cart'}
        id="cart"
        name="cart"
        onChange={onChange}
        type="radio"
        value="/cart"
      />
      <label htmlFor="cart">
        Cart<span>({state.totalQuantity})</span>
      </label>
    </span>
  );
}
