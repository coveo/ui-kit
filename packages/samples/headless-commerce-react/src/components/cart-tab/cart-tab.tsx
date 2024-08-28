import {Cart} from '@coveo/headless/commerce';
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
        type="radio"
        id="cart"
        name="cart"
        value="/cart"
        checked={window.location.pathname === '/cart'}
        onChange={onChange}
      />
      <label htmlFor="cart">
        Cart<span>({state.totalQuantity})</span>
      </label>
    </span>
  );
}
