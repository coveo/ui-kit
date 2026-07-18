import {BaseController} from '@/src/internal/utils/index.js';
import type {Supports, EndpointThunk} from '@/src/internal/utils/index.js';
import type {StateSelector} from '@/src/internal/engine/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import {getOrCreatePaginationActions} from '@/src/internal/features/pagination/index.js';
import {getOrCreatePaginationSelectors} from '@/src/internal/features/pagination/index.js';
import {getOrCreatePaginationSlice} from '@/src/internal/features/pagination/index.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

class PaginationControllerImpl extends BaseController<PaginationControllerState> {
  #thunk: EndpointThunk;
  #actions: ReturnType<typeof getOrCreatePaginationActions>;
  #controllerState: StateSelector<PaginationControllerState>;

  constructor(options: PaginationControllerOptions) {
    const {engine, resolveFacade} = getInterfaceInternals(options.interface);

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

    this.#thunk = resolveFacade('search');
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
    this.engine.mutate(this.#thunk({engine: this.engine}));
  }

  setPageSize(pageSize: number): void {
    if (pageSize < 1) {
      return;
    }

    this.engine.mutate(this.#actions.setFirstResult(0));
    this.engine.mutate(this.#actions.setPageSize(pageSize));
    this.engine.mutate(this.#thunk({engine: this.engine}));
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
