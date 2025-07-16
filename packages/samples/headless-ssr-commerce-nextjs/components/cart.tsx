'use client';

import {useCart, useContext} from '@/lib/commerce-engine';
import {adjustQuantity, emptyCart, purchase} from '@/utils/cart';
import {formatCurrency} from '@/utils/format-currency';

export default function Cart() {
  const {state, methods} = useCart();
  const {state: contextState} = useContext();

  const isCartEmpty = () => {
    return state.items.length === 0;
  };

  const language = () => contextState.language;
  const currency = () => contextState.currency;

  return (
    <div>
      <ul id="cart">
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
              <span>{formatCurrency(item.price, language(), currency())}</span>
              <span> {item.price}</span>
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
              <span> {item.price * item.quantity}</span>
            </p>
            <button
              type="button"
              onClick={() => adjustQuantity(methods!, item, 1)}
            >
              Add one
            </button>
            <button
              type="button"
              onClick={() => adjustQuantity(methods!, item, -1)}
            >
              Remove one
            </button>
            <button
              type="button"
              onClick={() => adjustQuantity(methods!, item, -item.quantity)}
            >
              Remove all
            </button>
          </li>
        ))}
      </ul>
      <p>
        <span>Total: </span>
        <span> {formatCurrency(state.totalPrice, language(), currency())}</span>
        <span> {state.totalPrice}</span>
      </p>
      <button
        type="button"
        disabled={isCartEmpty()}
        onClick={() => purchase(methods!, state.totalPrice)}
      >
        Purchase
      </button>
      <button
        type="button"
        disabled={isCartEmpty()}
        onClick={() => emptyCart(methods!)}
      >
        Empty cart
      </button>
    </div>
  );
}
