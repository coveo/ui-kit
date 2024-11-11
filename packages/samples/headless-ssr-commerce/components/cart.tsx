'use client';

import {useCart, useContext} from '@/lib/commerce-engine';
import {formatCurrency} from '@/utils/format-currency';
import {CartItem} from '@coveo/headless-react/ssr-commerce';

export default function Cart() {
  const {state, methods} = useCart();
  const {state: contextState} = useContext();

  const adjustQuantity = (item: CartItem, delta: number) => {
    methods?.updateItemQuantity({
      ...item,
      quantity: item.quantity + delta,
    });
  };

  const isCartEmpty = () => {
    return state.items.length === 0;
  };

  const purchase = () => {
    methods?.purchase({id: crypto.randomUUID(), revenue: state.totalPrice});
  };

  const emptyCart = () => {
    methods?.empty();
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
