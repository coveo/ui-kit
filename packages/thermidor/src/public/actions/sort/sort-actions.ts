import type {Supports} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import {
  getOrCreateSortActions,
  getOrCreateSortSlice,
  toSetSortContext,
} from '@/src/internal/features/sort/index.js';
import type {
  CommerceSortCriterion,
  SearchSortCriterion,
  SortCriterionFor,
} from '@/src/public/sort-types.js';

type SortCriterion =
  | SearchSortCriterion
  | CommerceSortCriterion
  | (SearchSortCriterion | CommerceSortCriterion)[];

export interface LoadSortActionsOptions<T extends Supports<'search'>> {
  interface: T;
}

export function loadSortActions<T extends Supports<'search'>>(options: LoadSortActionsOptions<T>) {
  const {engine, resolveFacade} = getInterfaceInternals(options.interface);
  engine.adoptSlice(getOrCreateSortSlice(options.interface));
  const thunk = resolveFacade('search');
  const sortActions = getOrCreateSortActions(options.interface);
  return {
    sortBy(criterion: SortCriterionFor<T> | SortCriterionFor<T>[]) {
      const sortCriterion = criterion as SortCriterion;
      engine.mutate(sortActions.sortBy(sortCriterion));
      return engine.mutate(
        thunk({
          engine,
          actionIntent: {name: 'set_sort', context: toSetSortContext(sortCriterion)},
        })
      );
    },
  };
}
