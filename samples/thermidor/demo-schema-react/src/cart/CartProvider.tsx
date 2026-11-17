import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';
import {readBootstrappedCart} from './bootstrapped-cart.js';
import {createCartStore, type CartStore} from './cart-store.js';

export const CartStoreContext = createContext<CartStore | null>(null);

interface CartProviderProps {
  /** Read on the first render only. */
  store?: CartStore;
}

export function CartProvider({store, children}: PropsWithChildren<CartProviderProps>) {
  const [providedStore] = useState(
    () => store ?? createCartStore(undefined, readBootstrappedCart())
  );

  return <CartStoreContext.Provider value={providedStore}>{children}</CartStoreContext.Provider>;
}

export function useCart() {
  const store = useContext(CartStoreContext);
  if (!store) {
    throw new Error('useCart must be used within a CartProvider');
  }
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return {
    ...snapshot,
    load: store.load,
    add: store.add,
    remove: store.remove,
    purchase: store.purchase,
  };
}
