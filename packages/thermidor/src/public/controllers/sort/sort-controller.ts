import {BaseController} from '@/src/internal/utils/index.js';
import type {Supports, EndpointThunk} from '@/src/internal/utils/index.js';
import type {StateSelector} from '@/src/internal/engine/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import {getOrCreateSortActions} from '@/src/internal/features/sort/index.js';
import {getOrCreateSortSelectors} from '@/src/internal/features/sort/index.js';
import {getOrCreateSortSlice} from '@/src/internal/features/sort/index.js';
import type {SortCriterionFor} from '@/src/public/sort-types.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

function structuralEqual(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => structuralEqual(item, b[i]));
  }
  if (typeof a === 'object' && typeof b === 'object' && a && b) {
    const {displayName: _a, ...restA} = a as any;
    const {displayName: _b, ...restB} = b as any;
    return JSON.stringify(restA) === JSON.stringify(restB);
  }
  return a === b;
}

class SortControllerImpl extends BaseController<SortControllerState<any>> {
  #thunks: EndpointThunk[];
  #sortActions: ReturnType<typeof getOrCreateSortActions>;
  #controllerState: StateSelector<SortControllerState<any>>;

  constructor(options: SortControllerOptions<any>) {
    const {engine, resolveFacades} = getHandleInternals(options.interface);

    engine.adoptSlice(getOrCreateSortSlice(options.interface));

    const selectors = getOrCreateSortSelectors(options.interface);
    const sortActions = getOrCreateSortActions(options.interface);

    const controllerState = createMemoizedStateSelector(
      selectors.getAppliedSort,
      selectors.getAvailableSorts,
      (appliedSort, availableSorts) => ({appliedSort, availableSorts})
    ) as unknown as StateSelector<SortControllerState<any>>;

    super(engine, controllerState);

    this.#thunks = resolveFacades('search');
    this.#sortActions = sortActions;
    this.#controllerState = controllerState;
  }

  sortBy(criterion: any): void {
    this.engine.mutate(this.#sortActions.sortBy(criterion));
    for (const thunk of this.#thunks) {
      this.engine.mutate(thunk({engine: this.engine}));
    }
  }

  isSortedBy(criterion: any): boolean {
    const {appliedSort} = this.engine.read(this.#controllerState);
    if (!appliedSort) {
      return false;
    }
    return structuralEqual(appliedSort, criterion);
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
