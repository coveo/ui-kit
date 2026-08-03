import type {Supports} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import {getOrCreateSortActions, getOrCreateSortSlice} from '@/src/internal/features/sort/index.js';
import type {SortCriterionFor} from '@/src/public/sort-types.js';

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
      engine.mutate(sortActions.sortBy(criterion as any));
      return engine.mutate(thunk({engine}));
    },
  };
}
