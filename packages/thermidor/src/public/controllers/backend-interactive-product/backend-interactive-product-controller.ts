import type {
  ConverseController,
  BackendSurfaceAction,
} from '../converse/converse-controller.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';

export interface BackendInteractiveProductController {
  select(): void;
  cancelPendingSelect(): void;
}

export interface BackendInteractiveProductControllerOptions {
  interface: GenerativeInterface;
  converseController: ConverseController;
  surfaceId: string;
  product: {
    productId: string;
    name: string;
    price: number;
  };
  position: number;
}

export const buildBackendInteractiveProductController = (
  options: BackendInteractiveProductControllerOptions
): BackendInteractiveProductController => {
  let pendingTimeout: ReturnType<typeof setTimeout> | null = null;
  let sent = false;

  function sendClick() {
    if (sent) return;
    sent = true;
    const action: BackendSurfaceAction = {
      type: 'product_click',
      surfaceId: options.surfaceId,
      productId: options.product.productId,
      name: options.product.name,
      price: options.product.price,
      position: options.position,
    };
    options.converseController.sendAction(action);
  }

  return {
    select() {
      if (sent) return;
      sendClick();
      if (pendingTimeout) {
        clearTimeout(pendingTimeout);
        pendingTimeout = null;
      }
      pendingTimeout = setTimeout(() => {
        pendingTimeout = null;
      }, 1000);
    },
    cancelPendingSelect() {
      if (pendingTimeout) {
        clearTimeout(pendingTimeout);
        pendingTimeout = null;
      }
    },
  };
};
