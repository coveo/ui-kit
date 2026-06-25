import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {ConverseController} from '../converse/converse-controller.js';
import type {Controller} from '../controller-types.js';

export interface BackendCartController extends Controller<BackendCartControllerState> {
  updateItemQuantity(item: BackendCartItem): void;
}

export interface BackendCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface BackendCartControllerState {
  items: BackendCartItem[];
}

export interface BackendCartControllerOptions {
  interface: GenerativeInterface;
  converseController: ConverseController;
}

export const buildBackendCartController = (
  options: BackendCartControllerOptions
): BackendCartController => {
  let items: BackendCartItem[] = [];

  return {
    get state(): BackendCartControllerState {
      return {items};
    },
    subscribe() {
      return () => {};
    },
    updateItemQuantity(item) {
      const existing = items.findIndex((i) => i.productId === item.productId);
      if (item.quantity <= 0) {
        if (existing !== -1) {
          items = items.filter((_, i) => i !== existing);
        }
        options.converseController.sendAction({
          type: 'cart_action',
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: 0,
          action: 'remove',
        });
      } else {
        if (existing !== -1) {
          items = items.map((i, idx) => (idx === existing ? item : i));
        } else {
          items = [...items, item];
        }
        options.converseController.sendAction({
          type: 'cart_action',
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          action: 'add',
        });
      }
    },
  };
};
