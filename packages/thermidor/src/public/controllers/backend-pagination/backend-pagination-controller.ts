import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateBackendInterfacesSelectors} from '@/src/core/internal/backend-interfaces/backend-interfaces-selectors.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {
  ConverseController,
  BackendInterfaceAction,
} from '../converse/converse-controller.js';
import type {Controller} from '../controller-types.js';

export interface BackendPaginationController extends Controller<BackendPaginationControllerState> {
  selectPage(page: number): void;
  setPageSize(pageSize: number): void;
}

export interface BackendPaginationControllerState {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface BackendPaginationControllerOptions {
  interface: GenerativeInterface;
  converseController: ConverseController;
  interfaceId: string;
}

export const buildBackendPaginationController = (
  options: BackendPaginationControllerOptions
): BackendPaginationController => {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];
  const selectors = getOrCreateBackendInterfacesSelectors(stateId);
  const getInterface = selectors.getInterface(options.interfaceId);

  const controllerState = createMemoizedStateSelector(
    getInterface,
    (entry): BackendPaginationControllerState => {
      const pagination = entry?.state?.pagination as
        | {
            page?: number;
            pageSize?: number;
            totalEntries?: number;
            totalPages?: number;
          }
        | undefined;
      return {
        page: pagination?.page ?? 0,
        pageSize: pagination?.pageSize ?? 0,
        totalCount: pagination?.totalEntries ?? 0,
        totalPages: pagination?.totalPages ?? 0,
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
    selectPage(page) {
      const action: BackendInterfaceAction = {
        type: 'select_page',
        interfaceId: options.interfaceId,
        page,
      };
      options.converseController.sendAction(action);
    },
    setPageSize(pageSize) {
      const action: BackendInterfaceAction = {
        type: 'set_page_size',
        interfaceId: options.interfaceId,
        pageSize,
      };
      options.converseController.sendAction(action);
    },
  };
};
