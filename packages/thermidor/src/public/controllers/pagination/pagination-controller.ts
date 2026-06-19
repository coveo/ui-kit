import type {Controller} from '../controller-types.js';
import type {Requires} from '@/src/core/interface/utils/interface-types.js';
import {getOrCreatePaginationActions} from '@/src/core/internal/pagination/pagination-actions.js';
import {getOrCreatePaginationSelectors} from '@/src/core/internal/pagination/pagination-selectors.js';
import {getOrCreatePaginationSlice} from '@/src/core/internal/pagination/pagination-slice.js';
import type {Dispatchable} from '@/src/core/interface/engine/engine-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID, THUNKS} from '@/src/core/interface/utils/symbols.js';

export const buildPaginationController = (
  options: PaginationControllerOptions
): PaginationController => {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];

  engine.adoptSlice(getOrCreatePaginationSlice(stateId));

  const selectors = getOrCreatePaginationSelectors(stateId);
  const actions = getOrCreatePaginationActions(stateId);

  const controllerState = createMemoizedStateSelector(
    selectors.getFirstResult,
    selectors.getPageSize,
    selectors.getTotalCount,
    (firstResult, pageSize, totalCount) => ({
      page: pageSize > 0 ? Math.floor(firstResult / pageSize) : 0,
      pageSize,
      totalCount,
      totalPages: pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0,
    })
  );

  return {
    get state() {
      return engine.read(controllerState);
    },
    subscribe(callback) {
      return engine.subscribe(controllerState, callback);
    },
    selectPage(page: number) {
      const {pageSize, totalCount} = engine.read(controllerState);
      const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;
      const currentPage = engine.read(controllerState).page;

      if (page < 0) {
        return;
      }
      if (page >= totalPages) {
        return;
      }
      if (page === currentPage) {
        return;
      }

      engine.mutate(actions.setFirstResult(page * pageSize));

      for (const thunk of options.interface[THUNKS].search) {
        engine.mutate(thunk({engine}) as Dispatchable);
      }
    },
    setPageSize(pageSize: number) {
      if (pageSize < 1) {
        return;
      }

      engine.mutate(actions.setFirstResult(0));
      engine.mutate(actions.setPageSize(pageSize));

      for (const thunk of options.interface[THUNKS].search) {
        engine.mutate(thunk({engine}) as Dispatchable);
      }
    },
  };
};

export interface PaginationControllerState {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginationController extends Controller<PaginationControllerState> {
  selectPage(page: number): void;
  setPageSize(pageSize: number): void;
}

export interface PaginationControllerOptions {
  interface: Requires<'search'>;
}
