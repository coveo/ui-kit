import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateBackendSurfacesSelectors} from '@/src/core/internal/backend-surfaces/backend-surfaces-selectors.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {Controller} from '../controller-types.js';

export interface BackendProductListController extends Controller<BackendProductListControllerState> {}

export interface BackendProductListControllerState {
  products: Record<string, unknown>[];
}

export interface BackendProductListControllerOptions {
  interface: GenerativeInterface;
  surfaceId: string;
}

export const buildBackendProductListController = (
  options: BackendProductListControllerOptions
): BackendProductListController => {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];
  const selectors = getOrCreateBackendSurfacesSelectors(stateId);
  const getSurface = selectors.getSurface(options.surfaceId);

  const controllerState = createMemoizedStateSelector(
    getSurface,
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
