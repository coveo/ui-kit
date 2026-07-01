import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateBackendInterfacesSelectors} from '@/src/core/internal/backend-interfaces/backend-interfaces-selectors.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {
  ConverseController,
  BackendInterfaceAction,
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
  interfaceId: string;
}

export const buildBackendSortController = (
  options: BackendSortControllerOptions
): BackendSortController => {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];
  const selectors = getOrCreateBackendInterfacesSelectors(stateId);
  const getInterface = selectors.getInterface(options.interfaceId);

  const controllerState = createMemoizedStateSelector(
    getInterface,
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
      const action: BackendInterfaceAction = {
        type: 'set_sort',
        interfaceId: options.interfaceId,
        sortCriteria: sort.sortCriteria,
        fields: sort.fields,
      };
      options.converseController.sendAction(action);
    },
  };
};
