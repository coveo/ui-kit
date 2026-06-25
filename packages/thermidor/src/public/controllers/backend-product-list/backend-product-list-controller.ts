import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateBackendInterfacesSelectors} from '@/src/core/internal/backend-interfaces/backend-interfaces-selectors.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {Controller} from '../controller-types.js';

export interface BackendProductListController extends Controller<BackendProductListControllerState> {}

export interface BackendProductListControllerState {
  products: Record<string, unknown>[];
}

export interface BackendProductListControllerOptions {
  interface: GenerativeInterface;
  interfaceId: string;
}

export const buildBackendProductListController = (
  options: BackendProductListControllerOptions
): BackendProductListController => {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];
  const selectors = getOrCreateBackendInterfacesSelectors(stateId);
  const getInterface = selectors.getInterface(options.interfaceId);

  const controllerState = createMemoizedStateSelector(
    getInterface,
    (entry): BackendProductListControllerState => ({
      products: (entry?.state?.products as Record<string, unknown>[]) ?? [],
    })
  );

  return {
    get state() {
      return engine.read(controllerState);
    },
    subscribe(callback) {
      return engine.subscribe(controllerState, callback);
    },
  };
};
