import {BaseController} from '@/src/internal/utils/index.js';
import type {Supports, EndpointThunk} from '@/src/internal/utils/index.js';
import type {StateSelector} from '@/src/internal/engine/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import {deepEqual} from '@/src/internal/utils/index.js';
import {getOrCreateSortActions} from '@/src/internal/features/sort/index.js';
import {getOrCreateSortSelectors} from '@/src/internal/features/sort/index.js';
import {getOrCreateSortSlice} from '@/src/internal/features/sort/index.js';
import type {SortCriterionFor} from '@/src/public/sort-types.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

const SORT_COMPARE_OPTIONS = {excludeKeys: ['displayName']};

class SortControllerImpl extends BaseController<SortControllerState<any>> {
  #thunk: EndpointThunk;
  #sortActions: ReturnType<typeof getOrCreateSortActions>;
  #controllerState: StateSelector<SortControllerState<any>>;

  constructor(options: SortControllerOptions<any>) {
    const {engine, resolveFacade} = getInterfaceInternals(options.interface);

    engine.adoptSlice(getOrCreateSortSlice(options.interface));

    const selectors = getOrCreateSortSelectors(options.interface);
    const sortActions = getOrCreateSortActions(options.interface);

    const controllerState = createMemoizedStateSelector(
      selectors.getAppliedSort,
      selectors.getAvailableSorts,
      (appliedSort, availableSorts) => ({appliedSort, availableSorts})
    ) as unknown as StateSelector<SortControllerState<any>>;

    super(engine, controllerState);

    this.#thunk = resolveFacade('search');
    this.#sortActions = sortActions;
    this.#controllerState = controllerState;
  }

  sortBy(criterion: any): void {
    this.engine.mutate(this.#sortActions.sortBy(criterion));
    this.engine.mutate(this.#thunk({engine: this.engine}));
  }

  isSortedBy(criterion: any): boolean {
    const {appliedSort} = this.engine.read(this.#controllerState);
    if (!appliedSort) {
      return false;
    }
    return deepEqual(appliedSort, criterion, SORT_COMPARE_OPTIONS);
  }
}

export function buildSortController<T extends Supports<'search'>>(
  options: SortControllerOptions<T>
): SortController<T> {
  return new SortControllerImpl(options) as unknown as SortController<T>;
}

export interface SortControllerState<T> {
  appliedSort: SortCriterionFor<T> | SortCriterionFor<T>[] | null;
  availableSorts: SortCriterionFor<T>[];
}

export interface SortController<T> extends Controller<SortControllerState<T>> {
  sortBy(criterion: SortCriterionFor<T> | SortCriterionFor<T>[]): void;
  isSortedBy(criterion: SortCriterionFor<T> | SortCriterionFor<T>[]): boolean;
}

export interface SortControllerOptions<T extends Supports<'search'>> {
  interface: T;
}
