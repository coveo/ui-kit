import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateBackendSurfacesSelectors} from '@/src/core/internal/backend-surfaces/backend-surfaces-selectors.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {
  ConverseController,
  BackendSurfaceAction,
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
  surfaceId: string;
}

export const buildBackendPaginationController = (
  options: BackendPaginationControllerOptions
): BackendPaginationController => {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];
  const selectors = getOrCreateBackendSurfacesSelectors(stateId);
  const getSurface = selectors.getSurface(options.surfaceId);

  const controllerState = createMemoizedStateSelector(
    getSurface,
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
      const action: BackendSurfaceAction = {
        type: 'select_page',
        surfaceId: options.surfaceId,
        page,
      };
      options.converseController.sendAction(action);
    },
    setPageSize(pageSize) {
      const action: BackendSurfaceAction = {
        type: 'set_page_size',
        surfaceId: options.surfaceId,
        pageSize,
      };
      options.converseController.sendAction(action);
    },
  };
};
