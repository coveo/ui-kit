'use client';

import {CartItem} from '@coveo/headless-react/ssr-commerce';
import {useCart, useContext} from '../_lib/commerce-engine';
import {formatCurrency} from '../_utils/format-currency';

export default function Cart() {
  const {state, controller} = useCart();
  const {state: contextState} = useContext();

  const adjustQuantity = (item: CartItem, delta: number) => {
    controller?.updateItemQuantity({
      ...item,
      quantity: item.quantity + delta,
    });
  };

  const isCartEmpty = () => {
    return state.items.length === 0;
  };

  const purchase = () => {
    controller?.purchase({id: crypto.randomUUID(), revenue: state.totalPrice});
  };

  const emptyCart = () => {
    controller?.empty();
  };

  const language = () => contextState.language;
  const currency = () => contextState.currency;

  return (
    <div>
      <ul>
        {state.items.map((item, index) => (
          <li key={index}>
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
              <span>{formatCurrency(item.price, language(), currency())}</span>
              <span>{item.price}</span>
            </p>
            <p>
              <span>Total: </span>
              <span>
                {formatCurrency(
                  item.price * item.quantity,
                  language(),
                  currency()
                )}
              </span>
              <span>{item.price * item.quantity}</span>
            </p>
            <button onClick={() => adjustQuantity(item, 1)}>Add one</button>
            <button onClick={() => adjustQuantity(item, -1)}>Remove one</button>
            <button onClick={() => adjustQuantity(item, -item.quantity)}>
              Remove all
            </button>
          </li>
        ))}
      </ul>
      <p>
        <span>Total: </span>
        {formatCurrency(state.totalPrice, language(), currency())}
        {state.totalPrice}
        <span></span>
      </p>
      <button disabled={isCartEmpty()} onClick={purchase}>
        Purchase
      </button>
      <button disabled={isCartEmpty()} onClick={emptyCart}>
        Empty cart
      </button>
    </div>
  );
}
