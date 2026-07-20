import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateBackendSurfacesSelectors} from '@/src/core/internal/backend-surfaces/backend-surfaces-selectors.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {ConverseController} from '../converse/converse-controller.js';
import type {Controller} from '../controller-types.js';

export interface BackendSearchBoxController extends Controller<BackendSearchBoxControllerState> {
  submit(): void;
}

export interface BackendSearchBoxControllerState {
  query: string;
  isLoading: boolean;
}

export interface BackendSearchBoxControllerOptions {
  interface: GenerativeInterface;
  converseController: ConverseController;
  surfaceId: string;
}

export const buildBackendSearchBoxController = (
  options: BackendSearchBoxControllerOptions
): BackendSearchBoxController => {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];
  const selectors = getOrCreateBackendSurfacesSelectors(stateId);
  const getSurface = selectors.getSurface(options.surfaceId);

  const controllerState = createMemoizedStateSelector(
    getSurface,
    (entry): BackendSearchBoxControllerState => ({
      query: (entry?.state?.query as string) ?? '',
      isLoading: false,
    })
  );

  return {
    get state() {
      return engine.read(controllerState);
    },
    subscribe(callback) {
      return engine.subscribe(controllerState, callback);
    },
    submit() {
      const {query} = engine.read(controllerState);
      options.converseController.sendAction({
        type: 'execute_search',
        query,
      });
    },
  };
};
