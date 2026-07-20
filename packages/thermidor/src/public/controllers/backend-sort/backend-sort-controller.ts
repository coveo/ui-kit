import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateBackendSurfacesSelectors} from '@/src/core/internal/backend-surfaces/backend-surfaces-selectors.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {
  ConverseController,
  BackendSurfaceAction,
} from '../converse/converse-controller.js';
import type {Controller} from '../controller-types.js';

export interface BackendSortCriterion {
  sortCriteria: string;
  fields?: Array<{field: string; direction: string}>;
}

export interface BackendSortController extends Controller<BackendSortControllerState> {
  sortBy(sort: BackendSortCriterion): void;
}

export interface BackendSortControllerState {
  appliedSort: BackendSortCriterion | undefined;
  availableSorts: BackendSortCriterion[];
}

export interface BackendSortControllerOptions {
  interface: GenerativeInterface;
  converseController: ConverseController;
  surfaceId: string;
}

export const buildBackendSortController = (
  options: BackendSortControllerOptions
): BackendSortController => {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];
  const selectors = getOrCreateBackendSurfacesSelectors(stateId);
  const getSurface = selectors.getSurface(options.surfaceId);

  const controllerState = createMemoizedStateSelector(
    getSurface,
    (entry): BackendSortControllerState => {
      const sort = entry?.state?.sort as
        | {
            appliedSort?: BackendSortCriterion;
            availableSorts?: BackendSortCriterion[];
          }
        | undefined;

      return {
        appliedSort: sort?.appliedSort,
        availableSorts: sort?.availableSorts ?? [],
      };
    }
  );

  return {
    get state() {
      return engine.read(controllerState);
    },
    subscribe(callback) {
      return engine.subscribe(controllerState, callback);
    },
    sortBy(sort) {
      const action: BackendSurfaceAction = {
        type: 'set_sort',
        surfaceId: options.surfaceId,
        sortCriteria: sort.sortCriteria,
        fields: sort.fields,
      };
      options.converseController.sendAction(action);
    },
  };
};
