import {BaseController} from '@/src/core/interface/base-controller.js';
import type {
  Supports,
  EndpointThunk,
} from '@/src/core/interface/utils/interface-types.js';
import type {StateSelector} from '@/src/core/interface/engine/engine-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import {getOrCreatePaginationActions} from '@/src/core/internal/pagination/pagination-actions.js';
import {getOrCreatePaginationSelectors} from '@/src/core/internal/pagination/pagination-selectors.js';
import {getOrCreatePaginationSlice} from '@/src/core/internal/pagination/pagination-slice.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

class PaginationControllerImpl extends BaseController<PaginationControllerState> {
  #thunks: EndpointThunk[];
  #actions: ReturnType<typeof getOrCreatePaginationActions>;
  #controllerState: StateSelector<PaginationControllerState>;

  constructor(options: PaginationControllerOptions) {
    const {engine} = getHandleInternals(options.interface);

    engine.adoptSlice(getOrCreatePaginationSlice(options.interface));

    const selectors = getOrCreatePaginationSelectors(options.interface);
    const actions = getOrCreatePaginationActions(options.interface);

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
    ) as unknown as StateSelector<PaginationControllerState>;

    super(engine, controllerState);

    this.#thunks = options.interface.resolveFacades('search');
    this.#actions = actions;
    this.#controllerState = controllerState;
  }

  selectPage(page: number): void {
    const {pageSize, totalCount} = this.engine.read(this.#controllerState);
    const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;
    const currentPage = this.state.page;

    if (page < 0 || page >= totalPages || page === currentPage) {
      return;
    }

    this.engine.mutate(this.#actions.setFirstResult(page * pageSize));
    for (const thunk of this.#thunks) {
      this.engine.mutate(thunk({engine: this.engine}));
    }
  }

  setPageSize(pageSize: number): void {
    if (pageSize < 1) {
      return;
    }

    this.engine.mutate(this.#actions.setFirstResult(0));
    this.engine.mutate(this.#actions.setPageSize(pageSize));
    for (const thunk of this.#thunks) {
      this.engine.mutate(thunk({engine: this.engine}));
    }
  }
}

export const buildPaginationController = (
  options: PaginationControllerOptions
): PaginationController => new PaginationControllerImpl(options);

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
  interface: Supports<'search'>;
}
