import {BaseController} from '@/src/internal/utils/index.js';
import type {Supports, EndpointThunk} from '@/src/internal/utils/index.js';
import type {StateSelector} from '@/src/internal/engine/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import {getOrCreateSortActions} from '@/src/internal/features/sort/index.js';
import {getOrCreateSortSelectors} from '@/src/internal/features/sort/index.js';
import {getOrCreateSortSlice} from '@/src/internal/features/sort/index.js';
import type {CommerceSearchSortCriterion} from '@/src/internal/api/commerce-search/index.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

class SortControllerImpl extends BaseController<SortControllerState> {
  #thunks: EndpointThunk[];
  #sortActions: ReturnType<typeof getOrCreateSortActions>;
  #controllerState: StateSelector<SortControllerState>;

  constructor(options: SortControllerOptions) {
    const {engine, resolveFacades} = getHandleInternals(options.interface);

    engine.adoptSlice(getOrCreateSortSlice(options.interface));

    const selectors = getOrCreateSortSelectors(options.interface);
    const sortActions = getOrCreateSortActions(options.interface);

    const controllerState = createMemoizedStateSelector(
      selectors.getAppliedSort,
      selectors.getAvailableSorts,
      (appliedSort, availableSorts) => ({appliedSort, availableSorts})
    ) as unknown as StateSelector<SortControllerState>;

    super(engine, controllerState);

    this.#thunks = resolveFacades('search');
    this.#sortActions = sortActions;
    this.#controllerState = controllerState;
  }

  sortBy(criterion: CommerceSearchSortCriterion): void {
    this.engine.mutate(this.#sortActions.sortBy(criterion));
    for (const thunk of this.#thunks) {
      this.engine.mutate(thunk({engine: this.engine}));
    }
  }

  isSortedBy(criterion: CommerceSearchSortCriterion): boolean {
    const {appliedSort} = this.engine.read(this.#controllerState);
    if (appliedSort === null) {
      return false;
    }
    return appliedSort.sortCriteria === criterion.sortCriteria;
  }
}

export const buildSortController = (options: SortControllerOptions): SortController =>
  new SortControllerImpl(options);

export interface SortControllerState {
  appliedSort: CommerceSearchSortCriterion | null;
  availableSorts: CommerceSearchSortCriterion[];
}

export interface SortController extends Controller<SortControllerState> {
  sortBy(criterion: CommerceSearchSortCriterion): void;
  isSortedBy(criterion: CommerceSearchSortCriterion): boolean;
}

export interface SortControllerOptions {
  interface: Supports<'search'>;
}
