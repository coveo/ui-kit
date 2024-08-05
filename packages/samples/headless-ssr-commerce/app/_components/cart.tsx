import {
  Cart as CartController,
  CartItem,
  CartState,
  Context as ContextController,
} from '@coveo/headless/ssr-commerce';
import {useEffect, useState, FunctionComponent} from 'react';
import {formatCurrency} from '../_utils/format-currency';

interface CartProps {
  staticState: CartState;
  controller?: CartController;
  contextController?: ContextController;
}

export const Cart: FunctionComponent<CartProps> = ({
  staticState,
  controller,
  contextController,
}) => {
  const [state, setState] = useState(staticState);

  useEffect(
    () => controller?.subscribe(() => setState({...controller.state})),
    [controller]
  );

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

  //TODO: server action maybe ?
  const language = () => contextController?.state.language ?? 'fr';
  const currency = () => contextController?.state.currency ?? 'cad';

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
      <hr></hr>
    </div>
  );
};
