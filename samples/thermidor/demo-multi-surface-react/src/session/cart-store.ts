import type {CommerceCartItem} from '@coveo/thermidor';
import type {UpdateCartPayload} from '@coveo/thermidor-schema';

export interface CartStore {
  getItems(): readonly CommerceCartItem[];
  subscribe(listener: () => void): () => void;
  /** Applies an `updateCart` payload, the same one the `Cart` surface sends to the server. */
  apply(update: UpdateCartPayload): void;
}

/**
 * The shopper's cart. The client owns its contents and sends them with every request in
 * `context.cart`; the `Cart` surface is the anchor its `updateCart` actions are dispatched from.
 */
export function createCartStore(initialItems: readonly CommerceCartItem[] = []): CartStore {
  let items = initialItems;
  const listeners = new Set<() => void>();

  function setItems(next: readonly CommerceCartItem[]) {
    items = next;
    for (const listener of listeners) {
      listener();
    }
  }

  return {
    getItems: () => items,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    apply({productId, name, price, quantity, operation}) {
      const existing = items.find((item) => item.productId === productId);
      if (operation === 'remove') {
        const remaining = (existing?.quantity ?? 0) - quantity;
        setItems(
          remaining > 0
            ? items.map((item) =>
                item.productId === productId ? {...item, quantity: remaining} : item
              )
            : items.filter((item) => item.productId !== productId)
        );
        return;
      }
      const nextQuantity = operation === 'add' ? (existing?.quantity ?? 0) + quantity : quantity;
      if (existing) {
        setItems(
          items.map((item) =>
            item.productId === productId ? {...item, quantity: nextQuantity} : item
          )
        );
        return;
      }
      setItems([
        ...items,
        {productId, name: name ?? productId, price: price ?? 0, quantity: nextQuantity},
      ]);
    },
  };
}
