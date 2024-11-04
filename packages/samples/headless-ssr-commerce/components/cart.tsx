'use client';

import {useCart, useContext} from '@/lib/commerce-engine';
import {adjustQuantity, emptyCart, purchase} from '@/utils/cart';
import {formatCurrency} from '@/utils/format-currency';

export default function Cart() {
  const {state, controller} = useCart();
  const {state: contextState} = useContext();

  const isCartEmpty = () => {
    return state.items.length === 0;
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
            <button onClick={() => adjustQuantity(controller!, item, 1)}>
              Add one
            </button>
            <button onClick={() => adjustQuantity(controller!, item, -1)}>
              Remove one
            </button>
            <button
              onClick={() => adjustQuantity(controller!, item, -item.quantity)}
            >
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
      <button
        disabled={isCartEmpty()}
        onClick={() => purchase(controller!, state.totalPrice)}
      >
        Purchase
      </button>
      <button disabled={isCartEmpty()} onClick={() => emptyCart(controller!)}>
        Empty cart
      </button>
    </div>
  );
}
