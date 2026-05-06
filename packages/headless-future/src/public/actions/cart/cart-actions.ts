import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {cartSlice} from '@/src/core/internal/cart/cart-slice.js';
import * as cartMutators from '@/src/core/interface/cart/cart-mutators.js';
import type {CartItem} from '@/src/core/interface/cart/cart-types.js';

type MutatorToAction<T> = T extends (...args: infer A) => any
  ? (...args: A) => void
  : never;

type MutatorsToActions<T> = {
  [K in keyof T]: MutatorToAction<T[K]>;
};

const loadedEngine = new WeakSet<Engine>();

const ensureLoaded = (engine: Engine) => {
  if (loadedEngine.has(engine)) {
    return;
  }

  const fullEngine = getFullEngine(engine);
  fullEngine.adoptSlice(cartSlice);
  loadedEngine.add(engine);
};

export const loadCartActions = (
  engine: Engine
): MutatorsToActions<typeof cartMutators> => {
  ensureLoaded(engine);
  const fullEngine = getFullEngine(engine);

  return {
    setItems: (items: CartItem[]) => {
      fullEngine.mutate(cartMutators.setItems(items));
    },
    updateItemQuantity: (item: CartItem) => {
      fullEngine.mutate(cartMutators.updateItemQuantity(item));
    },
  };
};
