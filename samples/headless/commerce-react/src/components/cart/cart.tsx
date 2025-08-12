import type {CartItem, Cart as HeadlessCart} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';
import {saveCartItemsToLocaleStorage} from '../../utils/cart-utils.js';
import {formatCurrency} from '../../utils/format-currency.js';

interface ICartProps {
  controller: HeadlessCart;
}

export default function Cart(props: ICartProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  // When the cart state changes, you should save it so that you can restore it when you initialize the commerce engine.
  useEffect(() => {
    controller.subscribe(() => {
      setState(controller.state);
      saveCartItemsToLocaleStorage(controller.state);
    });
  }, [controller]);

  const adjustQuantity = (item: CartItem, delta: number) => {
    controller.updateItemQuantity({
      ...item,
      quantity: item.quantity + delta,
    });
  };

  const isCartEmpty = () => {
    return state.items.length === 0;
  };

  const purchase = () => {
    controller.purchase({id: crypto.randomUUID(), revenue: state.totalPrice});
  };

  const emptyCart = () => {
    controller.empty();
  };

  return (
    <div className="Cart">
      <ul>
        {state.items.map((item) => (
          <li key={item.productId}>
            <p>
              <span>Name: </span>
              <span>{item.name}</span>
            </p>
            <p>
              <span>Quantity: </span>
              <span>{item.quantity}</span>
            </p>
            <p>
              <span>Price: </span>
              <span>{formatCurrency(item.price)}</span>
            </p>
            <p>
              <span>Total: </span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </p>
            <button type="button" onClick={() => adjustQuantity(item, 1)}>
              Add one
            </button>
            <button type="button" onClick={() => adjustQuantity(item, -1)}>
              Remove one
            </button>
            <button
              type="button"
              onClick={() => adjustQuantity(item, -item.quantity)}
            >
              Remove all
            </button>
          </li>
        ))}
      </ul>
      <p>
        <span>Total: </span>
        {formatCurrency(state.totalPrice)}
        <span></span>
      </p>
      <button type="button" disabled={isCartEmpty()} onClick={purchase}>
        Purchase
      </button>
      <button type="button" disabled={isCartEmpty()} onClick={emptyCart}>
        Empty cart
      </button>
      <hr />
    </div>
  );
}
